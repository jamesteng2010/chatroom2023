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

const { phone } = require("phone");
import CircularProgress from "@mui/material/CircularProgress";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import CodeVerify from "../code_verify";
import { sendRequest } from "@/utils/httpUtils";

export default function SignUp(props: any) {
  const { showSignUp, closeSignUp } = props;
  const countryList: any = getCountryCodeList();
  const [step, setStep] = useState(1);
  const [countryCode, setCountryCode] = useState("AU");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [sending, setSending] = useState(false);
  const [mobileValidate, setMobileValidate] = useState(true);
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
    setMobileValidate(true);
    setMobile(event.target.value);
  };

  const generateVerifyCode = async () => {
    const phoneNumber = `+${getCountryCallingCodeByCode(countryCode)}${mobile}`;
    console.log("phone number is ", phoneNumber);
    if (phone(phoneNumber).isValid) {
      setMobileValidate(true);
      setSending(true);

      await sendRequest("/api/signUp", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile: phoneNumber }),
      });

      console.log("keep going");
      setSending(false);
      setStep(2);
    } else {
      setMobileValidate(false);
    }
  };

  return (
    <Dialog open={showSignUp} onClose={closeSignUp}>
      <div className="signUpWindow">
        {step == 1 && (
          <>
            Fast way to connect new people
            {/* <div style={{ fontSize: 24, marginTop: 20, display: "flex" }}>
            You are
            <RadioGroup sx={{ marginLeft: 10 }} defaultValue="female">
              <FormControlLabel
                value="female"
                control={<Radio />}
                label="Female"
              />
              <FormControlLabel value="male" control={<Radio />} label="Male" />
            </RadioGroup>
          </div> */}
            {/* <div style={{ marginTop: 10 }}></div>
          <TextField
            value={name}
            label={"Name"}
            fullWidth
            sx={{ input: { color: "red", fontWeight: "bold" } }}
            style={{ marginTop: 10 }}
            error
          ></TextField> */}
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
            {!mobileValidate && (
              <div
                style={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <div className="errorMsg">
                  Invalid mobile number, please check
                </div>
                <div
                  style={{
                    flexGrow: 1,
                    display: "flex",
                    justifyContent: "end",
                  }}
                >
                  <ErrorOutlineRoundedIcon style={{ color: "red" }} />
                </div>
              </div>
            )}
          </>
        )}

        {step == 2 && (
          <CodeVerify
            mobile={`+${getCountryCallingCodeByCode(countryCode)}${mobile}`}
          />
        )}

        <DialogActions>
          <Button variant="outlined" onClick={closeSignUp}>
            Cancel
          </Button>
          <div style={{ marginLeft: 10 }}></div>
          <Button variant="outlined" onClick={generateVerifyCode}>
            {sending && <CircularProgress size={16} />}
            Next
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}
