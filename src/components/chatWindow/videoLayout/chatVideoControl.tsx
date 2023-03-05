import { CHAT_STATUS } from "@/config";
import { Button, CircularProgress, Fab } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StopIcon from "@mui/icons-material/Stop";
import {useContext, useEffect, useState} from 'react'
import AppContext from "@/context/userDataContext";
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

export default function ChatVideoControl(props: any) {
  const {largeScreen} = useContext(AppContext)
  const { chatStatus, stopMatching, startMatch,videoProp,disableVideo,disableAudio } = props;
  const [avControlPos,setAvControlPos] = useState({x:0,y:0})
  useEffect(()=>{
   
   
  },chatStatus)
  useEffect(()=>{
    const localVideoEle:any = document.getElementById("remoteVideo")
    var videoRatio = 0
    var marginOnVertical = false;
    var marginOnHor = false;
    if(localVideoEle){
   
      videoRatio = parseInt(localVideoEle.videoWidth) / parseInt(localVideoEle.videoHeight)
      const expect_videoWidth = parseInt(videoProp.height)*videoRatio
      console.log("expect video width : ",expect_videoWidth)
      const expect_videoHeight = parseInt(videoProp.width)/videoRatio
      console.log("expect video height : ",expect_videoHeight)
      if(expect_videoHeight<videoProp.height){
          marginOnVertical = true

          // setAvControlPos({
          //   y : (parseInt(videoProp.height) - expect_videoHeight)/2,
          //   x : videoProp.width - 130
          // })

      }
      if(expect_videoWidth<videoProp.width){
        marginOnHor = true
        setAvControlPos({
          x : parseInt(videoProp.width) - (parseInt(videoProp.width) - expect_videoWidth)/2-120,
          y : 0
        })
      }
      console.log(`margin on ver==>",${marginOnVertical};magin on hor==>,${marginOnHor}`)

    }

    console.log("video props is , ",videoProp)
  },[videoProp])
  return (
    <>
    
      <div className="videoControl">
      
        <div
          className="searchIcon"
          style={{
            background:  "white",
            width :largeScreen?'80px' : '60px',
            height : largeScreen ?'80px':'60px'
          }}
        >
          {chatStatus == CHAT_STATUS.CONNECTED && (
            <Button onClick={stopMatching}>Stop</Button>
          )}

          {chatStatus == CHAT_STATUS.IDEL && (
            <SearchIcon
              onClick={startMatch}
              style={{ fontSize: largeScreen? 58:42 }}
            ></SearchIcon>
          )}

          {chatStatus !== CHAT_STATUS.CONNECTED &&
            chatStatus != CHAT_STATUS.IDEL && (
              <div>
                <Button onClick={stopMatching}>
                  <StopIcon
                    style={{ fontSize: largeScreen?"64px":'52px', color: "red" }}
                  ></StopIcon>
                </Button>
              </div>
            )}
        </div>

        <div className="avControl" id="avControl">
        <div style={{display : 'flex',color:'red'}}>
          <Button size="small" onClick={disableVideo} ><VideocamOffIcon></VideocamOffIcon></Button>
         
          <Button size="small" onClick={disableAudio}>  <VolumeOffIcon></VolumeOffIcon></Button>
         
        
        </div>
      </div>
      </div>
   
    </>
  );
}
