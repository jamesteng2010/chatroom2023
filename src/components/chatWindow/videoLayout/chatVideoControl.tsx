import { CHAT_STATUS } from "@/config";
import { Button, CircularProgress, Fab } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StopIcon from "@mui/icons-material/Stop";

export default function ChatVideoControl(props: any) {
  const { chatStatus, stopMatching, startMatch } = props;
  return (
    <>
      <div className="videoControl">
        <div
          className="searchIcon"
          style={{
            background:  "white",
          }}
        >
          {chatStatus == CHAT_STATUS.CONNECTED && (
            <Button onClick={stopMatching}>Stop</Button>
          )}

          {chatStatus == CHAT_STATUS.IDEL && (
            <SearchIcon
              onClick={startMatch}
              style={{ fontSize: 58 }}
            ></SearchIcon>
          )}

          {chatStatus !== CHAT_STATUS.CONNECTED &&
            chatStatus != CHAT_STATUS.IDEL && (
              <div>
                <Button onClick={stopMatching}>
                  <StopIcon
                    style={{ fontSize: "64px", color: "red" }}
                  ></StopIcon>
                </Button>
              </div>
            )}
        </div>
      </div>
   
    </>
  );
}
