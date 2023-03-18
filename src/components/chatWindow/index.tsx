import Dialog from "@mui/material/Dialog";
import { useRef, useEffect, useState, useContext } from "react";
import { Button, CircularProgress, Fab } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { sendRequest, sleep } from "@/utils/httpUtils";
import { getCookie } from "cookies-next";
import { getDiffFromNow, getNow, getTimeBetweenNow } from "@/utils/dateUtils";
import { convertUint8ToString, getRandomStr } from "@/utils/strUtil";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { io } from "socket.io-client";
import {
  CHAT_STATUS,
  GlobalConfig,
  PEER_CMD,
  SERVER_ERROR_TYPE,
  SOCKET_CMD,
} from "@/config";

import ChatSnackBar from "../ui/snackbar";
import ChatVideoLayout from "./videoLayout/chatVideoLayout";
import AppContext from "@/context/userDataContext";

export default function ChatWindow(props: any) {
  const [peer, setPeer] = useState(null as any);
  const [socket, setSocket] = useState(null as any);

  const [localStream, setLocalStream] = useState(null as any);
  const [remoteStream, setRemoteStream] = useState(null as any);
  const [mediaControls, setMediaControls] = useState({
    video: true,
    audio: true,
  });
  const [chatStatus, setChatStatus] = useState(CHAT_STATUS.IDEL);
  const [role, setRole] = useState("");
  const [peerId, setPeerId] = useState("");
  const [clientToken, setClientToken] = useState("");
  const appContext = useContext(AppContext);
  const { appInFore } = appContext;
  const { show, closeChatWindow } = props;
  const [slaveCall, setSlaveCall] = useState(null as any);
  const [masterCall, setMasterCall] = useState(null as any);
  const [peerDataConnection, setPeerDataConnection] = useState(null as any);
  const [serverErrorType, setServerErrorType] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [geo, setGeo] = useState([] as any);

  const [videoProp, setVideoProp] = useState({
    width: "auto" as any,
    height: "auto" as any,
  });
  const [peerLastActivity, setPeerLastActivity] = useState(0);

  const [snackBarState, setSnackBarState] = useState(null as any);

  const constraints = {
    audio: true,
    video: true,
    width: { ideal: 4096 },
    height: { ideal: 2160 },
    facingMode: "environment",
  };

  useEffect(() => {
    const clientToken: any = getCookie("clientToken");
    if (show) {
      getUserLocation();
      // get client token

      setClientToken(clientToken);
      // load peer js and initialized peer
      if (typeof navigator !== "undefined") {
        const Peer = require("peerjs").default;
        setPeer(new Peer());
      }

      // initilize the socket
      console.log("initlized the socket===========>");
      try {
        const tempSocket = io(GlobalConfig.backendAPI.host);
        setSocket(tempSocket);
      } catch (e) {
        console.log("failed to connect socket server");
        setServerErrorType(SERVER_ERROR_TYPE.FAILED_CONNECT_SOCKET);
      }

      window.addEventListener("resize", setVideoSize);
      setVideoSize();
    } else {
      if (socket) {
        socket.off(`${clientToken}_matched`);
        setSocket(null);
      }

      resetPeer();
    }
  }, [show]);

  const getUserLocation = async () => {
    const userLocation: any = await sendRequest(
      "https://geolocation-db.com/json/",
      {
        method: "GET",
      }
    );
    setGeo([userLocation.latitude, userLocation.longitude]);
    console.log("got user location....");
    console.log(userLocation);
  };

  const resetPeer = () => {
    if (peer) {
      console.log(
        "==========>>>>> disconnect the peer and destory peer=====>>>>>"
      );
      try {
        peer.disconnect();
        peer.destory();
      } catch (e) {
        console.log(e);
      }
    }
  };

  const setVideoSize = () => {
    setVideoProp({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

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

  useEffect(() => {
    console.log("use effect in chat window");
    if (show && appInFore) {
      console.log(
        " >>>>>>> Beginning : start to initialize the preview*************** "
      );

      showPreview();
    } else {
      console.log(">>>>> stop preview and release camera and mic>>>>>>");
      if (localStream) {
        localStream.getTracks().forEach(function (track: any) {
          track.stop();
        });
        setChatStatus(CHAT_STATUS.IDEL);
        setLocalStream(null);
      }
    }
  }, [show, appInFore]);

  useEffect(() => {
    if (peer && localStream) {
      console.log("setup peer events.....");
      peer.on("open", (peerId: any) => {
        console.log("peer id is , ", peerId);
        setPeerId(peerId);
      });

      peer.on("call", (tempSlaveCall: any) => {
        console.log("get call from master, answer it now>>>>>>>>>>>");

        tempSlaveCall.answer(localStream);
        console.log("on slave side , local stream is , ", localStream);
        console.log("slave call is , ", tempSlaveCall);
        tempSlaveCall.on("stream", (masterStream: any) => {
          mediaConnectionEstablished();
          console.log("set remote stream as master stream>>>>>>>>>>>");
          setRemoteStream(masterStream);
        });

        setSlaveCall(tempSlaveCall);
      });

      peer.on("error", (err: any) => {
        setServerErrorType(SERVER_ERROR_TYPE.FAILED_GET_PEER_ID);
        console.log("there is error on peer, ", err);
      });

      peer.on("connection", (dataConn: any) => {
        console.log(
          "get a connection from peer, which keep in slave side====>>>>>"
        );
        setPeerDataConnection(dataConn);
      });
    }
  }, [peer, localStream]);

  const mediaConnectionEstablished = () => {
    console.log("master and slave connected!!!");
    setChatStatus(CHAT_STATUS.CONNECTED);
    clearPeerMatch_whenConnected();
  };

  useEffect(() => {
    if (socket && localStream) {
      console.log("setup socket match event=================>>>>>>>>");
      socket.on(`${clientToken}_matched`, async (data: any) => {
        console.log(">>>>> matched, which is ", data);
        const { dest, room, partner } = data;
        if (dest) {
          console.log("find dest is ,", dest);
          console.log("now local stream is , ", localStream);
          const tempMasterCall = peer.call(dest, localStream);
          console.log("master call is , ", tempMasterCall);
          try {
            tempMasterCall.on("stream", (slaveStream: any) => {
              console.log("get slave stream is , ", slaveStream);
              mediaConnectionEstablished();
              setRemoteStream(slaveStream);
            });
            setMasterCall(tempMasterCall);
            const partnerInfo = await sendRequest(
              "/api/getUserInfoByClientToken",
              {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ queryClient: partner,returnFields:{name : 1} }),
              }
            );
            console.log("partnerInfo is ,", partnerInfo);
          } catch (e) {
            console.log(e);
          }

          // start a data connection to peer
          console.log(
            "start a data connection to talk each other while connecting..."
          );
          var dataConn = peer.connect(dest);
          setPeerDataConnection(dataConn);
        }
      });
    }
  }, [socket, localStream]);

  useEffect(() => {
    if (peerDataConnection) {
      peerDataConnection.on("close", () => {
        const stopButtonPressedEle: any =
          document.getElementById("stopButtonPressed");
        console.log(
          "now stop button pressed value is , ",
          stopButtonPressedEle.value
        );
        if (stopButtonPressedEle.value != "Y") {
          startChat();
        }
      });
    }
  }, [peerDataConnection, chatStatus]);

  useEffect(() => {
    if (chatStatus == CHAT_STATUS.MATCHING) {
      console.log("1. start matching partner>>>>>>>>>>");
      matchPartnerViaSocketServer();
      updateMatchingTimeStamp();
    }
    if (chatStatus == CHAT_STATUS.IDEL) {
    }
  }, [chatStatus]);

  const matchPartnerViaSocketServer = async () => {
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
          clientToken: clientToken,

          createdTime: getNow(),
          status: "searching",
          lastUpdate: getNow(),
          peerId: peerId,
        }),
      }
    );
    console.log(createOfferResult);
    console.log(">>>>>>connecting to socket server");

    console.log(">>>>> setup socket and emit server with client token >>>>>>");

    socket.emit("matching_chat_partner", { clientToken: clientToken });
  };

  const clearPeerMatch_whenConnected = async () => {
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

  const showPreview = async () => {
    try {
      const supportedConstraints =
        navigator.mediaDevices.getSupportedConstraints();
      console.log("support constraints is : ");
      console.log(supportedConstraints);
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream: any) => {
          console.log("local stream is , ", stream);
          setLocalStream(stream);
        })
        .catch(() => {});
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
    stopMatching();
    setPeerId("");

    closeChatWindow && closeChatWindow();
  };
  const startChat = () => {
    setChatStatus(CHAT_STATUS.MATCHING);
  };
  const stopMatching = () => {
    const stopButtonPressedEle: any =
      document.getElementById("stopButtonPressed");
    if (stopButtonPressedEle) {
      stopButtonPressedEle.value = "Y";
    }
    setChatStatus(CHAT_STATUS.IDEL);
    if (peerDataConnection) {
      peerDataConnection.close();
    }
    if (socket) {
      socket.off(`${clientToken}_matched`);
    }
  };

  const disableVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled =
        !localStream.getVideoTracks()[0].enabled;
      if (peerDataConnection) {
        peerDataConnection.send(PEER_CMD.STOP_VIDEO);
      }
    }
  };
  const disableAudio = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled =
        !localStream.getAudioTracks()[0].enabled;
      if (peerDataConnection) {
        peerDataConnection.send(PEER_CMD.STOP_AUDIO);
      }
    }
  };
  return (
    <>
      <Dialog fullScreen open={show} onClose={closeChat}>
        <div style={{ background: "black", overflow: "hidden" }}>
          <div className="closeIcon" onClick={closeChat}>
            <ArrowBackIcon></ArrowBackIcon>
          </div>

          <ChatVideoLayout
            disableAudio={disableAudio}
            disableVideo={disableVideo}
            chatStatus={chatStatus}
            stopMatching={stopMatching}
            startMatch={startChat}
            videoProp={videoProp}
            localStream={localStream}
            remoteStream={remoteStream}
            peerId={peerId}
            dataConn={peerDataConnection}
          ></ChatVideoLayout>
          {/* <div className="contactUsOnVideo">
            <a href="https://form.jotform.com/223587988216876" target="abc">
              Contact us
            </a>
          </div> */}
        </div>

        <input type="hidden" value="N" id="stopButtonPressed" />
        <input
          type="hidden"
          value={peerLastActivity}
          id="timePartnerLast"
        ></input>
        <input type="hidden" id="chatStatus" value={chatStatus}></input>
      </Dialog>
      {snackBarState && (
        <ChatSnackBar snackState={snackBarState}></ChatSnackBar>
      )}
    </>
  );
}
