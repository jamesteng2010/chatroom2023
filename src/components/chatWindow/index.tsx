import Dialog from "@mui/material/Dialog";
import { useRef, useEffect, useState } from "react";
import { Button, CircularProgress, Fab } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { sendRequest, sleep } from "@/utils/httpUtils";
import { getCookie } from "cookies-next";
import { getDiffFromNow, getNow, getTimeBetweenNow } from "@/utils/dateUtils";
var Peer = require("simple-peer");
export default function ChatWindow(props: any) {
  const { show, closeChatWindow } = props;

  const [videoProp, setVideoProp] = useState({ width: 0, height: 0 });
  const [matching, setMatching] = useState(false);

  const [stream, setStream] = useState(null as any);
  const [peer, setPeer] = useState(null as any);
  const [slaveAnswer, setSlaveAnswer] = useState(null as any);
  const [connected, setConnected] = useState(false);
  const [time_partnerLast,setTime_partnerLast]  = useState(0)
  const [partnerLost,setParnterLost] = useState(false)

  var remoteVideo: any;

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
    remoteVideo = document.querySelector("#remoteVideo");

    setVideoProp({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    remoteVideo.srcObject = stream;
  };

  useEffect(() => {
    console.log("peer created");

    peer &&
      peer.on("signal", async (offer: any) => {
        console.log("generated the offier is ,", offer);
        if (offer.type == "offer") {
          updateMasterOffer(offer);
        }
        if (offer.type == "answer") {
          tellMaster_slaveAnswer(offer);
        }
      });

    peer &&
      peer.on("connect", async () => {
        console.log(" peer connected ");
        setMatching(false);
        setConnected(true);
      });

    peer &&
      peer.on("error", (err: any) => {
        console.log("error happens : ", err);
        setConnected(false);
        startMatch();
      });

    peer &&
      peer.on("data", (data: any) => {
        console.log("receive data from ====>", data);
        if(data == "[CMD]:IAMLIVE"){
           setTime_partnerLast(getNow())
        }
      });

    console.log(peer);
  }, [peer]);

  useEffect(() => {
    if (connected) {
      tellPartnerIAmAlive();

    }
  }, [connected]);

  const tellPartnerIAmAlive = () => {
    peer && peer.send("[CMD]:IAMLIVE");
    setTimeout(() => {
      const connectEle: any = document.getElementById("connected");
      if (connectEle.value == "T") {
        tellPartnerIAmAlive();
      }
    }, 1000);
  };

  const checkPartnerStatus = ()=>{
    if(getDiffFromNow(time_partnerLast,"seconds")>5){
        setParnterLost(true)
    }
    else{
      checkPartnerStatus()
    }
    
  }

  useEffect(()=>{
    console.log("partner lost , now should handle ....")
  },[partnerLost])



  useEffect(() => {
    if (slaveAnswer) {
      console.log(
        "step 7 : master get slave answer , so signal for confirm again"
      );
      console.log("slave answer is , ", slaveAnswer);
      console.log("peer is , ", peer);
      peer && peer.signal(slaveAnswer);
    }
  }, [slaveAnswer]);

  // step 1. send peer offer to server to save it

  const createPeerMatch = async () => {
    console.log("step 1 : create peer match ....");
    try {
      const clientToken = await getCookie("clientToken");
      const createOfferResult = await sendRequest(
        "/api/matching/writeMasterOffer",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            offerInfo: {
              clientToken,

              createdTime: getNow(),
              status: "searching",
              lastUpdate: getNow(),
            },
          }),
        }
      );

      findPartner();
    } catch (e) {
      setMatching(false);
      console.log("on step 1 , failed to save master offer");
    }
  };

  // step 2 : find the avilable partner
  const findPartner = async () => {
    console.log("step 2 : find avilable partner");
    const clientToken = await getCookie("clientToken");
    const findRequestResult = await sendRequest(
      "/api/matching/findPeerAndLock",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientToken }),
      }
    );
  };

  const startMatch = async () => {
    setMatching(true);
    await createPeerMatch();
    sendHeartBeatWhenSearching();
  };

  const sendHeartBeatWhenSearching = async () => {
    console.log("keep retrieve itself status ");
    const matchingEle: any = document.getElementById("matchingEle");
    if (!matchingEle) {
      return;
    }
    console.log("matching value is ", matchingEle.value);
    if (matchingEle.value == "T") {
      const clientToken = await getCookie("clientToken");

      const heartBeatResult = await sendRequest(
        "/api/matching/matchingHeartBeat",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clientToken }),
        }
      );

      if (
        heartBeatResult.status == "peering" &&
        heartBeatResult.role == "master"
      ) {
        const lockedByEle: any = document.getElementById("lockedBy");
        lockedByEle && (lockedByEle.value = heartBeatResult.lockedBy);
        masterSignal();
        waitSlaveAnswer();
      } else if (
        heartBeatResult.status == "peering" &&
        heartBeatResult.role == "slave" &&
        heartBeatResult.lockedUserOffer != null
      ) {
        console.log("step 5 : slave get offer and signal ");
        const tempPeer = new Peer({ initiator: false, trickle: false });
        setPeer(tempPeer);
        tempPeer.signal(heartBeatResult.lockedUserOffer);
      } else {
        await sleep(1000);
        sendHeartBeatWhenSearching();
      }
    } else {
      console.log("stop to send request");
    }
  };

  const tellMaster_slaveAnswer = async (answer: any) => {
    console.log("step 6 : slave update master record for the answer");
    const clientToken = await getCookie("clientToken");
    const tellRequestResult = await sendRequest(
      "/api/matching/tellMasterSlaveAnswer",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lockedBy: clientToken, answer }),
      }
    );
  };
  // step 6 : waiting for slave answer
  const waitSlaveAnswer = async () => {
    const clientToken = await getCookie("clientToken");
    const heartBeatResult = await sendRequest(
      "/api/matching/matchingHeartBeat",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientToken }),
      }
    );
    if (heartBeatResult && heartBeatResult.slaveAnswer) {
      setSlaveAnswer(heartBeatResult.slaveAnswer);
    } else {
      await sleep(200);
      waitSlaveAnswer();
    }
  };

  // step 3 : master create offer to slave
  const masterSignal = () => {
    console.log("step 3 : master create peer and provide offer");
    setPeer(new Peer({ initiator: true, trickle: false }));
  };

  // step 4 : save offer to slave record
  const updateMasterOffer = async (masterOffer: any) => {
    console.log(">>>> step 4: save offer to slave record");
    try {
      const lockedByEle: any = document.getElementById("lockedBy");
      const clientToken = await getCookie("clientToken");
      const saveOfferResult = await sendRequest(
        "/api/matching/updateMasterOffer",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientToken: lockedByEle.value,
            lockedBy: clientToken,
            offer: masterOffer,
          }),
        }
      );
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {}, [matching]);

  const stopMatching = async () => {
    const clientToken = await getCookie("clientToken");
    setMatching(false);
    console.log("stop matching.....");
    sendRequest("/api/matching/cleanAfterStop", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clientToken }),
    });
    setPeer(null);
    setConnected(false);
  };

  const closeChat = () => {
    console.log("close chat window, so clean everything...");
    if (matching || connected) {
      stopMatching();
    }
    closeChatWindow && closeChatWindow();
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
            {connected && <Button>Next</Button>}
            {!matching && !connected && (
              <SearchIcon
                onClick={startMatch}
                style={{ fontSize: 58 }}
              ></SearchIcon>
            )}
            <input
              type="hidden"
              value={matching ? "T" : "F"}
              id="matchingEle"
            ></input>

            <input
              type="hidden"
              value={connected ? "T" : "F"}
              id="connected"
            ></input>

            <input type="hidden" id="lockedBy"></input>

            {matching && (
              <div>
                <CircularProgress onClick={stopMatching}></CircularProgress>
              </div>
            )}
          </div>
        </div>
        <div>
          <video autoPlay id="localVideo" className="localVideo"></video>
          <video
            style={{ width: videoProp.width, height: videoProp.height }}
            id="remoteVideo"
            autoPlay
          ></video>
        </div>
      </div>
    </Dialog>
  );
}
