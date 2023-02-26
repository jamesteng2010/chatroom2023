import Dialog from "@mui/material/Dialog";
import { useRef, useEffect, useState, useContext } from "react";
import { Button, CircularProgress, Fab } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { sendRequest, sleep } from "@/utils/httpUtils";
import { getCookie } from "cookies-next";
import { getDiffFromNow, getNow, getTimeBetweenNow } from "@/utils/dateUtils";
import { convertUint8ToString, getRandomStr } from "@/utils/strUtil";
import { io } from "socket.io-client";
import { CHAT_STATUS, GlobalConfig, PEER_CMD, SOCKET_CMD } from "@/config";

import ChatSnackBar from "../ui/snackbar";
import ChatVideoLayout from "./videoLayout/chatVideoLayout";
import AppContext from "@/context/userDataContext";
var Peer = require("simple-peer");
export default function ChatWindow(props: any) {
  const appContext = useContext(AppContext);
  const { appInFore } = appContext;
  const { show, closeChatWindow } = props;

  const [videoProp, setVideoProp] = useState({
    width: "auto" as any,
    height: "auto" as any,
  });
  const [matching, setMatching] = useState(false);

  const [localStream, setLocalStream] = useState(null as any);
  const [remoteStream, setRemoteStream] = useState(null as any);
  const [chatStatus, setChatStatus] = useState(CHAT_STATUS.IDEL);
  const [socket, setSocket] = useState(null as any);
  const [roomName, setRoomName] = useState("");
  const [role, setRole] = useState("");
  const [peer, setPeer] = useState(null as any);
  const [peerLastActivity, setPeerLastActivity] = useState(0);
  const chatStatusRef: any = useRef();
  const [snackBarState, setSnackBarState] = useState(null as any);

  useEffect(() => {
    window.addEventListener("resize", setVideoSize);
    setVideoSize();
  }, []);

  useEffect(() => {
    console.log("app in fore, ", appInFore);
    stopMatching();
  }, [appInFore]);

  const handleSnackBarClose = () => {
    setSnackBarState({
      ...snackBarState,
      open: false,
    });
  };

  const setVideoSize = () => {
    setVideoProp({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    console.log("use effect in chat window");
    if (show) {
      console.log("start to initialize the preview ");

      showPreview();
    } else {
      if (localStream) {
        localStream.getTracks().forEach(function (track: any) {
          track.stop();
        });

        setLocalStream(null);
      }
    }
  }, [show]);

  const constraints = {
    audio: true,
    video: true,
    width: { ideal: 4096 },
    height: { ideal: 2160 },
    facingMode: "environment",
  };

  const showPreview = async () => {
    try {
      const supportedConstraints =
        navigator.mediaDevices.getSupportedConstraints();
      console.log("support constraints is : ");
      console.log(supportedConstraints);
      const tempLocalStream: any = await navigator.mediaDevices.getUserMedia(
        constraints
      );

      // handleSuccess(tempLocalStream);
      setLocalStream(tempLocalStream);
    } catch (e) {
      setSnackBarState({
        open: true,
        message: "failed to get media device",
        snackType: "error",
        handleClose: handleSnackBarClose,
      });
      console.log(e);
    }
  };

  const closeChat = () => {
    if (
      chatStatus == CHAT_STATUS.CONNECTED ||
      chatStatus == CHAT_STATUS.MATCHING
    ) {
      stopMatching();
    }
    closeChatWindow && closeChatWindow();
  };

  useEffect(() => {
    const clientToken = getCookie("clientToken");

    if (chatStatus == CHAT_STATUS.MATCHING) {
      matchPartnerViaSocketServer();
    }
    if (chatStatus == CHAT_STATUS.IDEL) {
      if (clientToken) {
        clearPeerMatch_whenConnected();
      }
      console.log(">>>>>> disconnect from socket server");
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      if (peer) {
        console.log("peer also is reset");
        peer.destroy();
        setPeer(null)
      }
    }

    if (chatStatus == CHAT_STATUS.CONNECTED) {
      clearPeerMatch_whenConnected();
      keepTellingPartner();
      checkPartnerStatus();
    }
  }, [chatStatus]);

  const keepTellingPartner = async () => {
    if (peer) {
      try {
        peer.send(PEER_CMD.I_AM_HERE);
        await sleep(500);

        keepTellingPartner();
      } catch (e) {
        console.log(e);
      }
    }
  };
  const updateMatchingTimeStamp = async () => {
    const chatStatusEle: any = document.getElementById("chatStatus");
    //chatStatusEle && console.log("now chat status value is ",chatStatusEle.value)
    if (
      chatStatusEle &&
      (parseInt(chatStatusEle.value) == CHAT_STATUS.CONNECTED ||
        parseInt(chatStatusEle.value) == CHAT_STATUS.IDEL)
    ) {
      return;
    }

    if (socket) {
      //console.log("update matching peer update time");
      const clientToken = getCookie("clientToken");
      try {
        socket.emit(
          "clientEventListener",
          {
            cmd: SOCKET_CMD.UPDATE_MATCHING_TIMESTAMP,
            clientToken,
          },
          (err: any) => {
            console.log(err);
          }
        );
      } catch (e) {
        console.log("connec to socket failed");
      }
    }

    await sleep(500);
    updateMatchingTimeStamp();
  };

  const checkPartnerStatus = async () => {
    const chatStatusEle: any = document.getElementById("chatStatus");
    if (
      chatStatusEle &&
      parseInt(chatStatusEle.value) !== CHAT_STATUS.CONNECTED
    ) {
      return;
    }

    const timePartnerLastEle: any = document.getElementById("timePartnerLast");
    if (timePartnerLastEle) {
      const lastUpdateTime = parseInt(timePartnerLastEle.value);

      if (getDiffFromNow(lastUpdateTime, "seconds") > 5) {
        console.log("destory peer now....")
        peer.destroy();
        setPeer(null)
        startMatch();
      } else {
        await sleep(500);
        checkPartnerStatus();
      }
    }
  };

  useEffect(() => {
    const clientToken = getCookie("clientToken");
    if (socket) {
      if (chatStatus == CHAT_STATUS.MATCHING) {
        updateMatchingTimeStamp();
      }
      socket.on("connect", async () => {
        console.log(">>>>> connected to socket successfully");
      });
      console.log(
        "set up client token matched event ====>",
        `${clientToken}_matched`
      );
      socket.on(`${clientToken}_matched`, async (data: any) => {
        if (clientToken == data.master || clientToken == data.slave) {
          console.log(">>>>> matched, which is ", data);
          setRoomName(data.room);
          const clientRole = clientToken == data.master ? "master" : "slave";
          setRole(clientRole);

          
          const emitEvtData = {cmd : SOCKET_CMD.TELL_SERVER_CLIENT_RECEIVED_MATCH, room : data.room,role : clientRole}
          console.log("event data is , ",emitEvtData)
          if(clientRole == "master"){
            setTimeout(()=>{
              socket.emit("clientEventListener",emitEvtData );
            },1000)
          }
          else{
            socket.emit("clientEventListener",emitEvtData );
          }
          
          if (clientRole == "slave") {
            socket.on(`${data.room}_slaveWaitMaster`, (masterOffer: any) => {
              createSlavePeer(masterOffer);
            });
          }
        } else {
          console.log("ignore this match, as it is not its match");
        }
      });
    } else {
      console.log(">>>>>socket is reset");
    }
  }, [socket, chatStatus]);

  useEffect(() => {
    if (peer) {
      peer.on("signal", async (offer: any) => {
        console.log(">>>>> signal data is , ", offer);
        if (offer.type == "offer") {
          const clientToken = await getCookie("clientToken");
          socket.emit("clientEventListener", {
            cmd: SOCKET_CMD.MASTER_SIGNAL,
            clientToken,
            offer,
            room: roomName,
          });
        }
        if (offer.type == "answer") {
          const clientToken = await getCookie("clientToken");
          socket.emit("clientEventListener", {
            cmd: SOCKET_CMD.SLAVE_ANSWER,
            clientToken,
            offer,
            room: roomName,
          });
        }
      });

      peer.on("connect", async () => {
        console.log(" >>>>>>>peer connected ");
        setChatStatus(CHAT_STATUS.CONNECTED);
        setPeerLastActivity(getNow());
        socket.disconnect();
      });

      peer.on("data", (data: any) => {
        const receivedStr = convertUint8ToString(data);
        //console.log("receive data from ====>", receivedStr);
        if (receivedStr == PEER_CMD.I_AM_HERE) {
          setPeerLastActivity(getNow());
        }
        if (receivedStr == PEER_CMD.PARTNER_STOP) {
          startMatch();
        }
      });
      peer.on("close", async () => {
        console.log("peer closed!!!, its role is , ", role);
      });
      peer.on("stream", async (stream: any) => {
        console.log(" remote stream is , ", stream);

        setRemoteStream(stream);
      });

      if (role == "master" && peer) {
        socket.on(`${roomName}_masterConfirm`, (slaveAnswer: any) => {
          peer.signal(slaveAnswer);
        });
      }
    }
    if (roomName && socket) {
      socket.on(`${roomName}_masterPeer`, () => {
        if (role == "master") {
          createMasterPeer();
        }
      });
    }
  }, [peer, roomName]);

  const createMasterPeer = () => {
    console.log(">>>> master create peer and signal to slave, and local stream is , ",localStream);
    const tempPeer = new Peer({ initiator: true, trickle: false})
    tempPeer.addStream(localStream)
    setPeer(tempPeer);

  };
  const createSlavePeer = (masterOffer: any) => {
    console.log(">>>>>> slave got master offer, so create slave side peer");
    const tempPeer = new Peer({
      initiator: false,
      trickle: false,
    });
    console.log(
      ">>>>>>slave add local stream to peer and  send stream to  partner"
    );
    tempPeer.addStream(localStream);
    setPeer(tempPeer);
    tempPeer.signal(masterOffer);
  };
  const matchPartnerViaSocketServer = async () => {
    const clientToken = await getCookie("clientToken");
    console.log(">>>>> insert search peer to peer match");
    const createOfferResult = await sendRequest(
      "/api/matching/insertSearchingPeer",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientToken,

          createdTime: getNow(),
          status: "searching",
          lastUpdate: getNow(),
        }),
      }
    );
    console.log(createOfferResult);
    console.log(">>>>>>connecting to socket server");

    console.log(">>>>> setup socket and emit server with client token >>>>>>");
    const tempSocket = io(GlobalConfig.backendAPI.host);
    setSocket(tempSocket);
    tempSocket.emit("matching_chat_partner", { clientToken });
  };

  const startMatch = () => {
    setChatStatus(CHAT_STATUS.MATCHING);
  };
  const stopMatching = async () => {
    setChatStatus(CHAT_STATUS.IDEL);
  };

  const clearPeerMatch_whenConnected = async () => {
    const clientToken = getCookie("clientToken");
    await sendRequest("/api/matching/removePeerMatch", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientToken,
      }),
    });
  };
  return (
    <>
      <Dialog fullScreen open={show} onClose={closeChat}>
        <div style={{ background: "black", overflow: "hidden" }}>
          <div className="closeIcon" onClick={closeChat}>
            <CloseIcon></CloseIcon>
          </div>

          <ChatVideoLayout
            chatStatus={chatStatus}
            stopMatching={stopMatching}
            startMatch={startMatch}
            videoProp={videoProp}
            localStream={localStream}
            remoteStream={remoteStream}
          ></ChatVideoLayout>
          <div className="contactUsOnVideo">
            <a href="https://form.jotform.com/223587988216876" target="abc">
              Contact us
            </a>
          </div>
        </div>

        <input
          type="hidden"
          value={peerLastActivity}
          id="timePartnerLast"
        ></input>
        <input
          type="hidden"
          id="chatStatus"
          value={chatStatus}
          ref={chatStatusRef}
        ></input>
      </Dialog>
      {snackBarState && (
        <ChatSnackBar snackState={snackBarState}></ChatSnackBar>
      )}
    </>
  );
}
