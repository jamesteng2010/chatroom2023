import {
  getCountryCallingCodeByCode,
  getCountryCodeList,
  getRandomName,
} from "@/utils/dataUtils";
import Dialog from "@mui/material/Dialog";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { signUpForUser } from "@/services/user.service";
const {phone} = require('phone');

export default function SignUp(props: any) {
  const { showSignUp, closeSignUp } = props;
  const countryList: any = getCountryCodeList();

  const [countryCode, setCountryCode] = useState("AU");
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState("");
  const changeCountryCode = (event: any) => {
    setCountryCode(event.target.value);
  };
  useEffect(() => {
    getUserInfo();
    const randName = getRandomName();

    setName(getRandomName());
  }, []);
  const getUserInfo = async () => {
    const res = await axios.get("https://geolocation-db.com/json/");
    if (res && res.data) {
      console.log(res.data);
      const counCode = res.data.country_code;
      setCountryCode(counCode);
    }
  };
  const changeMobile = (event: any) => {
    setMobile(event.target.value);
  };

  const validate = async () => {
    const phoneNumber = `+${getCountryCallingCodeByCode(countryCode)}${mobile}`;
    console.log("phone number is ", phoneNumber);
    if(phone(phoneNumber).isValid){
        signUpForUser({name,mobile:phoneNumber})
        console.log("keep going")
    }
    
  };

  return (
    <Dialog open={showSignUp} onClose={closeSignUp}>
      <div className="signUpWindow">
        Fast way to connect new people
        <div style={{ fontSize: 24, marginTop: 20, display: "flex" }}>
          You are
          <RadioGroup sx={{ marginLeft: 10 }} defaultValue="female">
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
          fullWidth
          sx={{ input: { color: "red", fontWeight: "bold" } }}
          style={{ marginTop: 10 }}
          error
        ></TextField>
        <div style={{ marginTop: 10 }}></div>
        <div>
          <Select
            variant="outlined"
            error
            fullWidth
            style={{ borderColor: "white", color: "white" }}
            id="country"
            value={countryCode}
            label="Country"
            onChange={changeCountryCode}
          >
            {Object.keys(countryList).map((countryCode: any) => {
              return (
                <MenuItem key={countryCode} value={countryCode}>
                  {countryList[countryCode]}
                </MenuItem>
              );
            })}
          </Select>
        </div>
        <TextField
          fullWidth
          onChange={changeMobile}
          value={mobile}
          label="Mobile"
          type={"number"}
          sx={{ input: { color: "red", fontWeight: "bold" } }}
          style={{ marginTop: 10 }}
          error
          
        ></TextField>
      </div>

      <DialogActions>
        <Button fullWidth onClick={validate}>
          Next
        </Button>
      </DialogActions>
    </Dialog>
  );
}
