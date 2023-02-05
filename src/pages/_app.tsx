import Header from "@/components/common/header";
import SiteLayout from "@/components/common/layout";
import HomePage from "@/components/home_page";
import SignUp from "@/components/signup";
import { useState } from "react";
import '../style.css'


export default function Index(){
    const [signUp,setSignUp] = useState(false)
    const closeSignUp = (event: any,reason:any)=>{
        if(reason && reason == "backdropClick"){
            return;
        }
        setSignUp(false)
    }
    return <SiteLayout loginClick={()=>setSignUp(true)}>
        <HomePage startVideoClick={()=>setSignUp(true)}></HomePage>
        <SignUp showSignUp={signUp} closeSignUp={closeSignUp}/>
    </SiteLayout>
}
