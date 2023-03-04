import { CHAT_STATUS } from "@/config";
import { Button, CircularProgress, Fab } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StopIcon from "@mui/icons-material/Stop";
import {useContext} from 'react'
import AppContext from "@/context/userDataContext";

export default function ChatVideoControl(props: any) {
  const {largeScreen} = useContext(AppContext)
  const { chatStatus, stopMatching, startMatch } = props;
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
      </div>
   
    </>
  );
}
