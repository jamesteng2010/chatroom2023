import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import CountUp from "react-countup";
import { Button } from "@mui/material";
import { Slide } from "react-slideshow-image";
import "react-slideshow-image/dist/styles.css";
import DuoIcon from '@mui/icons-material/Duo';
import SignUp from "./signup";
import { useState } from "react";
import {useContext,useEffect} from 'react'
import AppContext from "@/context/userDataContext";
import CircularProgress from "@mui/material/CircularProgress";

export default function HomePage(props:any) {
    const {startVideoClick} = props;
    const {largeScreen} = useContext(AppContext)
  // const largeScreen = useMediaQuery("(min-width:600px)");
  return (
    <div className="bodyPart">
      <Box sx={{ flexGrow: 1, height: "100%" }}>
        <Grid container sx={{ height: "100%" }}>
          <Grid item xs={largeScreen ? 7 : 12} className="leftPart">
            {" "}
            <LeftPart startVideoClick={startVideoClick} largeScreen={largeScreen}></LeftPart>
          </Grid>
          <Grid item xs={largeScreen ? 5 : 12}  className="rightPart">
            <RightPart largeScreen={largeScreen}></RightPart>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}



function LeftPart(props: any) {
  const { startVideoClick,largeScreen } = props;

  const appContext = useContext(AppContext)
  return (
    <>
      <div style={{ fontSize: largeScreen ? 78 : 40 }}> Chat Anytime</div>
      <div style={{ marginTop: 10 }}>
        Matched <CountUp  start={500} end={100000} duration={100000} /> persons
      </div>
      <div style={{ marginTop: 10 }}>
        {appContext.loadingUserData && <CircularProgress/>}
        {!appContext.loadingUserData && <Button onClick={startVideoClick} startIcon={<DuoIcon />} variant="outlined">Start Video Chat Now</Button>}
      
      </div>

    
    </>
  );
}

function RightPart(props:any) {
    const {largeScreen} = props;
  const images = [
    "demo/5-5b93908c-f774-436e-8ca5-eeb9f8c31849.jpeg",
    "demo/5-21b36b28-abcf-4405-a725-62278f8ea6eb.jpeg",
    "demo/5-cd0b7b94-0521-49c0-96cf-c47b9d57cade.jpeg",
  ];

  return (
    <div style={{display:'block'}}>
    <Slide autoplay duration={500} arrows={false}>
        {
            images.map((image,idx)=>{
                return    <div key={`img_${idx}`} className="each-slide-effect">
      
                <img width={largeScreen? 'auto' :  200} style={{ borderRadius:'50%'}} src={`${image}`}></img>
           
              </div>
            })
        }
     
    </Slide></div>
  );
}
