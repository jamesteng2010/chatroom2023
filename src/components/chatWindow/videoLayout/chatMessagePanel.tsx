import Button from "@mui/material/Button";
import { useContext, useEffect, useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AppContext from "@/context/userDataContext";

export default function ChatMessagePanel(props: any) {
  const {largeScreen} = useContext(AppContext)
  const { sendMessage, messageList,messageUpdateTime,closeChatWindow } = props;
  useEffect(() => {
    document.getElementById("messageField")?.focus();
  }, []);

  const changeMessage = (e: any) => {
    setMessage(e.target.value);
  };
  const sendMsgToPartner = ()=>{
    sendMessage(message)
    setMessage('')
  }
  const inputKeyDown = (e:any)=>{
    if(e.keyCode == 13){
      sendMsgToPartner()
    }
  }
 
  const [message, setMessage] = useState("");
  return (
    <div className={largeScreen?"messagePanel chatMessagePanel":" messagePanel floatChatMessagePanel"}  style={{minHeight:'300px'}}>
      <div className="closeChatIcon" onClick={closeChatWindow}><CancelOutlinedIcon/></div>
      <div className="chatWindowTitle">
        Chat with XXX
      </div>
      <div className="messageListPart">
    
        {messageList.map((m: any) => {
          return <div key={m.time}>{m.message}</div>;
        })}
      </div>
      <div className="messageActionPart">
        <input
        autoComplete="off"
        onKeyDown={inputKeyDown}
          placeholder="Say something...."
          type="text"
          id="messageField"
          className="messageInputField"
          value={message}
          onChange={changeMessage}
        />
        <div><SendIcon
          onClick={sendMsgToPartner}
          style={{ cursor: 'pointer', color: "black", marginLeft: 10 }}
        ></SendIcon></div>
        
      </div>
    </div>
  );
}
