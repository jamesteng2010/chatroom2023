import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import { useEffect, useState } from "react";

export default function TestPeerJS(props: any) {
  const { open } = props;
  const [peerId, setPeerId] = useState("");
  const [destId, setDestId] = useState("");
  const [peer, setPeer] = useState(null as any);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const Peer = require("peerjs").default;
      setPeer(new Peer());
    }

    console.log(navigator);
    showLocalVideo();
  }, []);

  useEffect(() => {
    if (peer & localStream) {
      peer.on("open", (id: any) => {
        setPeerId(id);
        console.log("my id is , ", id);
      });
      peer.on("connection", (conn: any) => {
        console.log("conntected by another peer");
        console.log("how many connects for this peer, ", peer.connections);
      });

      peer.on("call", (call: any) => {
        console.log("what is local stream now , ",localStream)
        call.answer(localStream);
        call.on("stream", (remoteStream: any) => {
          console.log("be called side get remote stream is , ", remoteStream);
          setRemoteStream(remoteStream);
        });
      });
    }
    if (localStream) {
        const videoEle: any = document.getElementById("localVideo");
        if (videoEle) {
          videoEle.srcObject = localStream;
          videoEle.play();
        }
      }
  }, [peer,localStream]);


  useEffect(() => {
    if (remoteStream) {
      const videoEle: any = document.getElementById("remoteVideo");
      if (videoEle) {
        videoEle.srcObject = remoteStream;
        videoEle.play();
      }
    }
  }, [remoteStream]);

  const showLocalVideo = () => {
    const nav: any = window.navigator;
    const getUserMedia =
      nav.getUserMedia || nav.webkitGetUserMedia || nav.mozGetUserMedia;
    getUserMedia({ video: true, audio: true }, function (stream: any) {
      console.log(stream);
      setLocalStream(stream);
    });
  };

  const changeDestId = (e: any) => {
    setDestId(e.target.value);
  };
  const connectPeer = () => {
    peer.connect(destId);
  };

  // the side who start the call , set remote stream with local stream
  const videoCall = () => {
    console.log("peer is , ", peer);
    const call = peer.call(destId, localStream);
    console.log("call is ", call);
    call.on("stream", (remoteStream: any) => {
      console.log("the remote stream which start call get is ,");
      console.log(remoteStream);
      setRemoteStream(remoteStream);
    });
  };

  return (
    <div>
      my peer id is : {peerId}
      <video id="localVideo"></video>
      <video id="remoteVideo"></video>
      <input type="text" value={destId} onChange={changeDestId}></input>
      <Button variant="outlined" onClick={connectPeer}>
        Connect Peer
      </Button>
      <Button variant="outlined" onClick={videoCall}>
        Video Call
      </Button>
    </div>
  );
}
