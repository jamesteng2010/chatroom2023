import { CHAT_STATUS } from "@/config";
import ChatVideoControl from "./chatVideoControl";
import { CircularProgress } from "@mui/material";
import { useRef, useEffect, useState } from "react";

export default function ChatVideoLayout(props: any) {
  const { chatStatus, videoProp, stopMatching, startMatch,localStream,remoteStream } = props;
 

  useEffect(()=>{
    console.log("now the chat status is , ",chatStatus)
    if(chatStatus == CHAT_STATUS.MATCHING){
      setLocalVideowhenMatching()
    }
    if(chatStatus == CHAT_STATUS.IDEL){
        setLocalVideoWhenIdle()
    }
    if(chatStatus == CHAT_STATUS.CONNECTED){
        setLocalVideoWhenIdle()
        setLocalVideowhenMatching()
    }
  },[chatStatus,localStream,remoteStream])

  const setLocalVideowhenMatching = ()=>{
    const localVidelEle: any = document.getElementById("localVideo");
    if (localVidelEle) {
      localVidelEle.srcObject = localStream;
    }
      console.log("when matching set  local stream.....",localStream)
  }

  const setLocalVideoWhenIdle = ()=>{
    const remoteVideoEle: any = document.getElementById("remoteVideo");
    if (remoteVideoEle) {
      remoteVideoEle.srcObject = localStream;
    }
      console.log("get local stream.....",localStream)
  }
  return (
    <>
      <ChatVideoControl
        chatStatus={chatStatus}
        startMatch={startMatch}
        stopMatching={stopMatching}
      ></ChatVideoControl>
      {chatStatus == CHAT_STATUS.IDEL && (
        <div>
          <video
            style={{
              width: videoProp.width,
              height: videoProp.height,
            }}
            id="remoteVideo"
          
            autoPlay
          ></video>
        </div>
      )}

      {chatStatus == CHAT_STATUS.MATCHING && (
        <>
          <video autoPlay id="localVideo" className="localVideo"></video>

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
        </>
      )}

      {
        chatStatus == CHAT_STATUS.CONNECTED &&  <>
           <video autoPlay id="localVideo" className="localVideo"></video>

           <video
            style={{
              width: videoProp.width,
              height: videoProp.height,
            }}
            id="remoteVideo"
          
            autoPlay
          ></video>
        </>
      }
    </>
  );
}
