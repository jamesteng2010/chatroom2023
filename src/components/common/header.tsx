import { Button } from "@mui/material";
import CurrencyExchangeSharpIcon from "@mui/icons-material/CurrencyExchangeSharp";
import useMediaQuery from "@mui/material/useMediaQuery";
import MenuSharpIcon from "@mui/icons-material/MenuSharp";
import Drawer from "@mui/material/Drawer";
import { useState } from "react";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import AccountCircleSharpIcon from "@mui/icons-material/AccountCircleSharp";
import {useContext,useEffect} from 'react'
import AppContext from "@/context/userDataContext";
import { getCookie } from "cookies-next";
import { sendRequest } from "@/utils/httpUtils";
import CircularProgress from "@mui/material/CircularProgress";


export default function Header(props: any) {
  const appContext = useContext(AppContext)
  const { loginClick } = props;
  const largeScreen = useMediaQuery("(min-width:600px)");
  const [drawerOpen, setDrawerOpen] = useState(false);


  useEffect(() => {
    verifyToken()
}, []);

const verifyToken = async ()=>{
  appContext.setLoadingUserData(true)
  const clientToken = await getCookie("clientToken");
  if(clientToken){
    const verifyResult = await sendRequest("/api/getUserInfoByClientToken", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

  
    if (verifyResult.result == 1) {
      console.log(verifyResult.foundUser.name)
      appContext.setUserData(verifyResult.foundUser.name)
    }
    else{
      if (verifyResult.result !== 1) {
        appContext.setSignUpStep(3);
        
      }
    }
  }
  appContext.setLoadingUserData(false)
}

  return (
    <div className="header">
      {!largeScreen && (
        <div style={{ marginRight: "10px" }}>
          <MenuSharpIcon onClick={() => setDrawerOpen(true)}></MenuSharpIcon>
        </div>
      )}
      <Drawer
        anchor={"left"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <List>
          <ListItem>
            <ListItemButton>
              <ListItemIcon>
                <CurrencyExchangeSharpIcon></CurrencyExchangeSharpIcon>
              </ListItemIcon>
              <ListItemText>Shop</ListItemText>
            </ListItemButton>
          </ListItem>
         
          <ListItem>
            <ListItemButton onClick={loginClick}>
              <ListItemIcon>
                <AccountCircleSharpIcon />
              </ListItemIcon>
              <ListItemText>Login</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      Video Chat
      {largeScreen && (
        <div className="headerTail">
          <Button
            variant="outlined"
            startIcon={<CurrencyExchangeSharpIcon></CurrencyExchangeSharpIcon>}
          >
            Shop
          </Button>
          <div style={{ marginLeft: 10 }}></div>
          {
            appContext.loadingUserData && <CircularProgress />
          }

          {
            !appContext.loadingUserData && !appContext?.userData && 
         
          <Button onClick={loginClick} variant="outlined">Login</Button>  }
          {
            <>{appContext?.userData}</>
          }
        </div>
      )}
    </div>
  );
}
