import { CHAT_STATUS } from "@/config";
import ChatVideoControl from "./chatVideoControl";
import { CircularProgress } from "@mui/material";
import { useRef, useEffect, useState } from "react";

export default function ChatVideoLayout(props: any) {
  const { chatStatus, videoProp, stopMatching, startMatch,localStream,remoteStream } = props;
 

  useEffect(()=>{
    console.log("now the chat status is , ",chatStatus)
    if(chatStatus == CHAT_STATUS.MATCHING){
      setVideoStream("localVideo",localStream)
      
    }
    if(chatStatus == CHAT_STATUS.IDEL){
        setVideoStream("remoteVideo",localStream)
       
    }
    if(chatStatus == CHAT_STATUS.CONNECTED){
        setVideoStream("localVideo",localStream)
        setVideoStream("remoteVideo",remoteStream);
      
    }
  },[chatStatus,localStream,remoteStream])

  const setVideoStream = (videoEleName:string,stream:any)=>{
    console.log(`set video stream for ${videoEleName}, its stream is ${stream}` )
    const videoEle :any = document.getElementById(videoEleName)
    if(videoEle){
      videoEle.srcObject = stream
    }
    // videoEle.play()
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