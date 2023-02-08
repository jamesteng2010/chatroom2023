import { getRandomName } from "@/utils/dataUtils";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import { useState,useEffect } from "react";

export default function SetupUserInfo(props:any){
   const {updateUserData} = props;
    const [gender,setGender]  = useState("male")
    const [name,setName] = useState(getRandomName())
    const changeGender = (event:any)=>{
        setGender(event.target.value)
    }
    const changeName = (event:any) =>{

      setName(event.target.value)
      updateUserData({gender,name : event.target.value})
    }
    useEffect(()=>{
      updateUserData({gender,name})
    },[name,gender])
    return <div>
         You are
         <div>
            <RadioGroup onChange={changeGender} sx={{ marginLeft: 10 }} value={gender} defaultValue="female">
              <FormControlLabel
                value="female"
                control={<Radio />}
                label="Female"
              />
              <FormControlLabel value="male" control={<Radio />} label="Male" />
            </RadioGroup>
          </div> 
             <div style={{ marginTop: 10 }}></div>
          <TextField
            value={name}
            label={"Name"}
            onChange={changeName}
            fullWidth
            sx={{ input: { color: "red", fontWeight: "bold" } }}
            style={{ marginTop: 10 }}
            error
          ></TextField> 
    </div>
}