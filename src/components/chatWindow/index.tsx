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
    if (show) {
      // get client token
      const clientToken: any = getCookie("clientToken");
      setClientToken(clientToken);
      // load peer js and initialized peer
      if (typeof navigator !== "undefined") {
        const Peer = require("peerjs").default;
        setPeer(new Peer());
      }

      // initilize the socket
      console.log("initlized the socket===========>");
      const tempSocket = io(GlobalConfig.backendAPI.host);
      setSocket(tempSocket);

      window.addEventListener("resize", setVideoSize);
      setVideoSize();
    } else {
      setSocket(null);
      resetPeer();
    }
  }, [show]);

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
        console.log("peer id is , ",peerId)
        setPeerId(peerId);
      });

      peer.on("call",(slaveCall:any)=>{
          console.log("get call from master, answer it now>>>>>>>>>>>")
          slaveCall.answer(localStream);
          console.log("on slave side , local stream is , ",localStream)
          console.log("slave call is , ",slaveCall)
          slaveCall.on("stream",(masterStream:any)=>{
            mediaConnectionEstablished()
            console.log("set remote stream as master stream>>>>>>>>>>>")
            setRemoteStream(masterStream)
          
          })
      })

     
    }
  }, [peer,localStream]);

  const mediaConnectionEstablished = ()=>{
    console.log("master and slave connected!!!")
    setChatStatus(CHAT_STATUS.CONNECTED)
    clearPeerMatch_whenConnected()
  }

  useEffect(() => {
    if (socket && localStream) {
      socket.on(`${clientToken}_matched`, async (data: any) => {
        console.log(">>>>> matched, which is ", data);
        const { dest, room } = data;
        if (dest) {
            console.log("find dest is ,",dest)
            console.log("now local stream is , ",localStream)
            const masterCall = peer.call(dest,localStream)
            console.log("master call is , ",masterCall)
            masterCall.on("stream",(slaveStream:any)=>{
              console.log("get slave stream is , ",slaveStream)
              mediaConnectionEstablished()
              setRemoteStream(slaveStream)
            })
        }
      });
    }
  }, [socket,localStream]);

  useEffect(() => {
    if (chatStatus == CHAT_STATUS.MATCHING) {
      console.log("1. start matching partner>>>>>>>>>>");
      matchPartnerViaSocketServer();
      updateMatchingTimeStamp();
    }
    if(chatStatus == CHAT_STATUS.IDEL){
      
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
    closeChatWindow && closeChatWindow();
  };
  const startChat = () => {
    setChatStatus(CHAT_STATUS.MATCHING);
  };
  const stopMatching = () => {
    setChatStatus(CHAT_STATUS.IDEL);
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
            startMatch={startChat}
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
        <input type="hidden" id="chatStatus" value={chatStatus}></input>
      </Dialog>
      {snackBarState && (
        <ChatSnackBar snackState={snackBarState}></ChatSnackBar>
      )}
    </>
  );
}
