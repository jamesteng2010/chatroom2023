import Dialog from "@mui/material/Dialog";
import { useRef, useEffect, useState } from "react";
import { Button, Fab } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
export default function ChatWindow(props: any) {
  const { show, closeChatWindow } = props;
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoProp, setVideoProp] = useState({ width: 0, height: 0 });

  const [stream, setStream] = useState(null as any);

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
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      handleSuccess(mediaStream);
      setStream(mediaStream);
      setVideoLoaded(true);
    } catch (e) {
      handleError(e);
    }
  };

  const handleSuccess = (stream: any) => {
    const video: any = document.querySelector("video");
    setVideoProp({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    video.srcObject = stream;
  };

  const handleError = (error: any) => {
    if (error.name === "OverconstrainedError") {
    } else if (error.name === "NotAllowedError") {
    }
  };
  const startMatch = () => {
    alert("matching");
  };

  return (
    <Dialog fullScreen open={show} onClose={closeChatWindow}>
      <div style={{ background: "black", overflow: "hidden" }}>
        <div className="closeIcon" onClick={closeChatWindow}>
          <CloseIcon></CloseIcon>
        </div>
        <div className="videoControl" onClick={startMatch}>
          <div className="searchIcon">
            <SearchIcon style={{ fontSize: 58 }}></SearchIcon>
          </div>
        </div>
        <div>
          <video
            style={{ width: videoProp.width, height: videoProp.height }}
            id="myVideo"
            autoPlay
          ></video>
        </div>
      </div>
    </Dialog>
  );
}
