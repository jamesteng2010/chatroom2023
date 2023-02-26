import {
  getCountryCallingCodeByCode,
  getCountryCodeList,
  getRandomName,
} from "@/utils/dataUtils";
import Dialog from "@mui/material/Dialog";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

const { phone } = require("phone");
import CircularProgress from "@mui/material/CircularProgress";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import CodeVerify from "../code_verify";
import { sendRequest } from "@/utils/httpUtils";
import SetupUserInfo from "./setupUserInfo";
import AppContext from "@/context/userDataContext";

export default function SignUp(props: any) {
  const appContext = useContext(AppContext);
  const { showSignUp, closeSignUp, intialStep } = props;
  const countryList: any = getCountryCodeList();
  const [step, setStep] = useState(intialStep);

  const [countryCode, setCountryCode] = useState("AU");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [sending, setSending] = useState(false);
  const [mobileValidate, setMobileValidate] = useState(true);
  const [country,setCountry] = useState("")
  const [ip,setIp] = useState("")
  const changeCountryCode = (event: any) => {
    setCountryCode(event.target.value);
  };
  useEffect(() => {
    if (showSignUp) {
      getUserInfo();
      const randName = getRandomName();

      setName(getRandomName());
    }
  }, [showSignUp]);
  useEffect(() => {
    setStep(intialStep);
    console.log("sign up step is , ", intialStep);
  }, [intialStep]);
  const getUserInfo = async () => {
    const res = await sendRequest("https://geolocation-db.com/json/", {
      method: "GET",
    });

    if (res) {
      console.log(res);
      const counCode = res.country_code;
      setCountryCode(counCode);
      setCountry(res.country_name)
      setIp(res.IPv4)
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

  const startVideoChart = async () => {
    // if start from step 3, then need to save user info
    if (step == 3) {
      await sendRequest("/api/saveUserInfo", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, gender,country,ip }),
      });
      appContext.setUserData({ name });
      closeSignUp();
    }
  };
  const updateUserInfo = (userData: any) => {
    setName(userData.name);
    setGender(userData.gender);
  };

  return (
    <Dialog open={showSignUp} onClose={closeSignUp}>
      <div className="signUpWindow">
        {step == 1 && (
          <>
            Fast way to connect new people
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
            setStep={setStep}
          />
        )}
        {step == 3 && (
          <SetupUserInfo updateUserData={updateUserInfo}></SetupUserInfo>
        )}
        {step == 4 && <div>Has user info, so just show start video chat</div>}

        <DialogActions>

          <Button variant="outlined" onClick={closeSignUp}>
            Cancel
          </Button>
          <div style={{ marginLeft: 10 }}></div>
          {(step == 3 || step == 4) && (
            <Button variant="outlined" onClick={startVideoChart}>
              Find Friends To Chat
            </Button>
          )}

          {(step == 1 || step == 2) && (
            <>
              <Button variant="outlined" onClick={generateVerifyCode}>
                {sending && <CircularProgress size={16} />}
                Next
              </Button>
            </>
          )}
        </DialogActions>
        <div className="contactUs"><a href='https://form.jotform.com/223587988216876' target='abc'>Contact us</a></div>
      </div>
    </Dialog>
  );
}
