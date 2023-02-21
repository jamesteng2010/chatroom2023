import Dialog from "@mui/material/Dialog";
import { useRef, useEffect, useState } from "react";
import { Button, CircularProgress, Fab } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { sendRequest, sleep } from "@/utils/httpUtils";
import { getCookie } from "cookies-next";
import { getDiffFromNow, getNow, getTimeBetweenNow } from "@/utils/dateUtils";
import { convertUint8ToString, getRandomStr } from "@/utils/strUtil";
import { io } from "socket.io-client";
import { CHAT_STATUS, GlobalConfig, PEER_CMD, SOCKET_CMD } from "@/config";
import StopIcon from "@mui/icons-material/Stop";
var Peer = require("simple-peer");
export default function ChatWindow(props: any) {
  const { show, closeChatWindow } = props;

  const [videoProp, setVideoProp] = useState({ width: 0, height: 0 });
  const [matching, setMatching] = useState(false);

  const [stream, setStream] = useState(null as any);
  const [chatStatus, setChatStatus] = useState(CHAT_STATUS.IDEL);
  const [socket, setSocket] = useState(null as any);
  const [roomName, setRoomName] = useState("");
  const [role, setRole] = useState("");
  const [peer, setPeer] = useState(null as any);
  const [peerLastActivity, setPeerLastActivity] = useState(0);
  const chatStatusRef: any = useRef();

  var remoteVideo: any;

  useEffect(() => {
    window.addEventListener("resize", setVideoSize);
    setVideoSize();
  }, []);

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
      setTimeout(() => {
        showPreview();
      }, 1000);
    } else {
      console.log("stream is ", stream);
      if (stream) {
        stream.getTracks().forEach(function (track: any) {
          track.stop();
        });

        setStream(null);
      }
    }
  }, [show]);

  const constraints = {
    audio: false,
    video: true,
  };

  const showPreview = async () => {
    try {
      const tempLocalStream: any = await navigator.mediaDevices.getUserMedia(
        constraints
      );

      handleSuccess(tempLocalStream);
      setStream(tempLocalStream);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSuccess = (stream: any) => {
    const remoteVideoEle: any = document.getElementById("remoteVideo");
    if (remoteVideoEle) {
      remoteVideoEle.srcObject = stream;
    }
  };

  const closeChat = () => {
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
    if (parseInt(chatStatusRef.current.value) === CHAT_STATUS.CONNECTED) {
      return;
    }
    if(socket){
      console.log("update matching peer update time")
      const clientToken = getCookie("clientToken");
      socket.emit("clientEventListener", {
        cmd: SOCKET_CMD.UPDATE_MATCHING_TIMESTAMP,
        clientToken,
      });
    }
  
    await sleep(500);
    updateMatchingTimeStamp();
  };

  const checkPartnerStatus = async () => {
    console.log("current chat status is , ", chatStatusRef.current.value);
    if (parseInt(chatStatusRef.current.value) !== CHAT_STATUS.CONNECTED) {
      return;
    }
    const timePartnerLastEle: any = document.getElementById("timePartnerLast");
    console.log("check partner status");
    if (timePartnerLastEle) {
      const lastUpdateTime = parseInt(timePartnerLastEle.value);
      console.log("time_partner last is , ", lastUpdateTime);
      console.log(
        "difference from now is , ",
        getDiffFromNow(lastUpdateTime, "seconds")
      );
      if (getDiffFromNow(lastUpdateTime, "seconds") > 5) {
        // if lost connection from partner, peer delete peer and reset itself

        peer.destroy();
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
      if(chatStatus == CHAT_STATUS.MATCHING){
        updateMatchingTimeStamp()
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
          if (clientToken == data.master) {
            setRole("master");
            createMasterPeer();
          } else {
            setRole("slave");
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
  }, [socket,chatStatus]);

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

      peer.on("stream", async (stream: any) => {
        console.log("stream is , ", stream);
        const localVideoEle: any = document.getElementById("localVideo");
        localVideoEle.srcObject = stream;
        localVideoEle.play();
      });

      if (role == "master") {
        socket.on(`${roomName}_masterConfirm`, (slaveAnswer: any) => {
          peer.signal(slaveAnswer);
        });
      }
    }
  }, [peer, roomName]);

  const createMasterPeer = () => {
    console.log(">>>> create peer and signal to slave");
    setPeer(new Peer({ initiator: true, trickle: false, stream: stream }));
  };
  const createSlavePeer = (masterOffer: any) => {
    console.log(">>>>>> slave got master offer, so create slave side peer");
    const tempPeer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
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
    const tempSocket = io(GlobalConfig.backendAPI.host);
    setSocket(tempSocket);

    tempSocket.emit("matching_chat_partner", { clientToken });
  };

  const startMatch = () => {
    setChatStatus(CHAT_STATUS.MATCHING);
    setLocalVideo();
  };
  const setLocalVideo = () => {
    const localVideoEle: any = document.getElementById("localVideo");
    if (localVideoEle) {
      localVideoEle.srcObject = stream;
      localVideoEle.play();
    }
  };
  const stopMatching = async () => {
    const remoteVideoEle: any = document.getElementById("remoteVideo");

    if (chatStatus == CHAT_STATUS.CONNECTED) {
      peer.send(PEER_CMD.PARTNER_STOP);
    }
    remoteVideoEle.srcObject = stream;

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
    <Dialog fullScreen open={show} onClose={closeChat}>
      <div style={{ background: "black", overflow: "hidden" }}>
        <div className="closeIcon" onClick={closeChat}>
          <CloseIcon></CloseIcon>
        </div>
        <div className="videoControl">
          <div
            className="searchIcon"
            style={{ background: matching ? "red" : "white" }}
          >
            {chatStatus == CHAT_STATUS.CONNECTED && (
              <Button onClick={stopMatching}>Stop</Button>
            )}
            {chatStatus == CHAT_STATUS.IDEL && (
              <SearchIcon
                onClick={startMatch}
                style={{ fontSize: 58 }}
              ></SearchIcon>
            )}

            {chatStatus !== CHAT_STATUS.CONNECTED &&
              chatStatus != CHAT_STATUS.IDEL && (
                <div>
                  <Button onClick={stopMatching}>
                    <StopIcon
                      style={{ fontSize: "64px", color: "red" }}
                    ></StopIcon>
                  </Button>
                </div>
              )}
          </div>
        </div>
        <div>
          <video
            style={{
              display: chatStatus != CHAT_STATUS.IDEL ? "block" : "none",
            }}
            autoPlay
            id="localVideo"
            className="localVideo"
          ></video>
          {chatStatus == CHAT_STATUS.MATCHING && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: videoProp.width,
                height: videoProp.height,
              }}
            >
              <CircularProgress></CircularProgress>
            </div>
          )}
          {
            <video
              style={{
                display:
                  chatStatus == CHAT_STATUS.IDEL ||
                  chatStatus == CHAT_STATUS.CONNECTED
                    ? "hidden"
                    : "block",
                width: videoProp.width,
                height: videoProp.height,
              }}
              id="remoteVideo"
              autoPlay
            ></video>
          }
        </div>
      </div>

      <input
        type="hidden"
        value={peerLastActivity}
        id="timePartnerLast"
      ></input>
      <input type="hidden" value={chatStatus} ref={chatStatusRef}></input>
    </Dialog>
  );
}
