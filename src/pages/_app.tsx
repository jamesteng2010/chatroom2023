import ChatWindow from "@/components/chatWindow";
import Header from "@/components/common/header";
import SiteLayout from "@/components/common/layout";
import HomePage from "@/components/home_page";
import SignUp from "@/components/signup";
import AppContext from "@/context/userDataContext";
import { sendRequest } from "@/utils/httpUtils";
import { getRandomStr } from "@/utils/strUtil";
import { getCookie } from "cookies-next";
import { useState, useContext, useEffect, useCallback } from "react";
import "../style.css";

export default function Index() {
  const appContext = useContext(AppContext);
  const [userData, setUserData] = useState("");
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [randomKey, setRandomKey] = useState("");
  const [signUp, setSignUp] = useState(false);
  const [signUpStep, setSignUpStep] = useState(1);
  const closeSignUp = (event: any, reason: any) => {
    if (reason && reason == "backdropClick") {
      return;
    }
    setRandomKey(getRandomStr(10));
    setSignUp(false);
  };
  const startToChat = async () => {
    if (userData) {
      setShowChatWindow(true);
    } else {
      setSignUp(true);
    }
  };

  const closeChatWindow = ()=>{
    setShowChatWindow(false)
  }

  return (
    <AppContext.Provider
      value={{
        userData,
        setUserData,
        loadingUserData,
        setLoadingUserData,
        setSignUpStep,
      }}
    >
      <SiteLayout loginClick={() => setSignUp(true)}>
        <HomePage startVideoClick={startToChat}></HomePage>
        <SignUp
          intialStep={signUpStep}
          key={randomKey}
          showSignUp={signUp}
          closeSignUp={closeSignUp}
        />
        <ChatWindow show={showChatWindow} closeChatWindow={closeChatWindow}></ChatWindow>
      </SiteLayout>
    </AppContext.Provider>
  );
}