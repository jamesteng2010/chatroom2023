import { CHAT_STATUS, PEER_CMD } from "@/config";
import ChatVideoControl from "./chatVideoControl";
import { CircularProgress } from "@mui/material";
import { useRef, useEffect, useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import ChatMessagePanel from "./chatMessagePanel";
import { getNow } from "@/utils/dateUtils";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";

export default function ChatVideoLayout(props: any) {
  const largeScreen = useMediaQuery("(min-width:600px)");
  const {
    chatStatus,
    videoProp,
    stopMatching,
    startMatch,
    localStream,
    remoteStream,
    peerId,
    dataConn,
    disableVideo,
    disableAudio,
  } = props;

  const [messageList, setMessageList] = useState([] as any);
  const [showChatWindow, setShowChatWindow] = useState(true);
  const [messageUpdateTime, setMessageUpdateTime] = useState(0);
  useEffect(() => {
    console.log("now the chat status is , ", chatStatus);
    if (chatStatus == CHAT_STATUS.MATCHING) {
      setVideoStream("localVideo", localStream);
    }
    if (chatStatus == CHAT_STATUS.IDEL) {
      setVideoStream("remoteVideo", localStream);
    }
    if (chatStatus == CHAT_STATUS.CONNECTED) {
      setVideoStream("localVideo", localStream);
      setVideoStream("remoteVideo", remoteStream);
    }
  }, [chatStatus, localStream, remoteStream]);

  useEffect(() => {
    if (dataConn) {
      dataConn.on("data", (data: any) => {
        if (data == PEER_CMD.STOP_VIDEO) {
          if (remoteStream) {
            remoteStream.getVideoTracks()[0].enabled =
              !remoteStream.getVideoTracks()[0].enabled;
          }
        }

        if (data == PEER_CMD.STOP_AUDIO) {
          if (remoteStream) {
            remoteStream.getAudioTracks()[0].enabled =
              !remoteStream.getAudioTracks()[0].enabled;
          }
        } else {
          const currentMsgList = messageList;
          const receivedMsg = JSON.parse(data);
          currentMsgList.push(receivedMsg);
          setMessageList(currentMsgList);
          console.log("what is now for list : ", messageList);
          setMessageUpdateTime(getNow());
        }
      });
    }
  }, [dataConn]);

  useEffect(() => {
    console.log("now message list is , ", messageList);
  }, [messageList]);

  const sendMessage = (msg: any) => {
    const currentMsgList = messageList;
    const sendingMsg = { peerId: peerId, message: msg, time: getNow() };

    currentMsgList.push(sendingMsg);
    dataConn.send(JSON.stringify(sendingMsg));
    setMessageList(currentMsgList);
    console.log(currentMsgList);
  };
  const setVideoStream = (videoEleName: string, stream: any) => {
    console.log(`set video stream for ${videoEleName}, its stream is`);
    console.log(stream);
    const videoEle: any = document.getElementById(videoEleName);
    if (videoEle) {
      console.log("found video element and set it");
      videoEle.srcObject = stream;
    }
  };

  return (
    <>
      {peerId && (
        <ChatVideoControl
          chatStatus={chatStatus}
          videoProp={videoProp}
          startMatch={startMatch}
          stopMatching={stopMatching}
          disableAudio={disableAudio}
          disableVideo={disableVideo}
        ></ChatVideoControl>
      )}
      {chatStatus == CHAT_STATUS.IDEL && (
        <div>
          <video
            muted
            style={{
              width: videoProp.width,
              height: videoProp.height,
            }}
            id="remoteVideo"
            autoPlay
          ></video>
        </div>
      )}

      {(chatStatus == CHAT_STATUS.MATCHING || !peerId) && (
        <>
          <video
            autoPlay
            id="localVideo"
            style={{ width: largeScreen ? 200 : 100 }}
            muted
            className="localVideo"
          ></video>

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

      {chatStatus == CHAT_STATUS.CONNECTED && (
        <div className="videoChatLayer">
          <div className="videos">
            <video
              className="localVideo"
              style={{ width: largeScreen ? 200 : 100 }}
              muted
              autoPlay
              id="localVideo"
            ></video>

            <video
              style={{
                width: videoProp.width,
                height: videoProp.height,
              }}
              id="remoteVideo"
              autoPlay
            ></video>
          </div>
          {showChatWindow && (
            <ChatMessagePanel
              closeChatWindow={() => {
                setShowChatWindow(false);
              }}
              messageUpdateTime={messageUpdateTime}
              messageList={messageList}
              sendMessage={sendMessage}
            />
          )}
          {!showChatWindow && (
            <div
              className="floatChatIcon"
              onClick={() => setShowChatWindow(true)}
            >
              <TextsmsOutlinedIcon />
            </div>
          )}
        </div>
      )}
    </>
  );
}
