
import { sendRequest } from "@/utils/httpUtils";
import { CircularProgress } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useState, useRef, useEffect } from "react";

export default function CodeVerify(props: any) {
  const { mobile } = props;
  const [sending, setSending] = useState(false);

  const [code1, setCode1] = useState("" as any);
  const [code2, setCode2] = useState("" as any);
  const [code3, setCode3] = useState("" as any);
  const [code4, setCode4] = useState("" as any);
  const [codes, setCodes] = useState("");
  const code1Ref = useRef<HTMLInputElement>(null);
  const code2Ref = useRef<HTMLInputElement>(null);
  const code3Ref = useRef<HTMLInputElement>(null);
  const code4Ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    code1Ref.current?.focus();
  }, []);
  const changeCode1 = (e: any) => {
    const typedValue = parseInt(e.target.value);

    if (typedValue > 9) {
      return false;
    } else {
      setCode1(typedValue);
      code2Ref.current?.focus();
    }
  };

  const changeCode2 = (e: any) => {
    const typedValue = parseInt(e.target.value);

    if (typedValue > 9) {
      return false;
    } else {
      setCode2(typedValue);
      code3Ref.current?.focus();
    }
  };
  const changeCode3 = (e: any) => {
    const typedValue = parseInt(e.target.value);

    if (typedValue > 9) {
      return false;
    } else {
      setCode3(typedValue);
      code4Ref.current?.focus();
    }
  };
  const changeCode4 = (e: any) => {
    const typedValue = parseInt(e.target.value);
    console.log("typed value is ", typedValue);
    if (typedValue > 9) {
      return false;
    } else {
      setCode4(typedValue);
      if (typedValue) {
        setCodes(`${code1}${code2}${code3}${typedValue}`);
      }
    }
  };

  useEffect(() => {
    if(codes){
      verifyTypedCode();
    }
    
  }, [codes]);
  const verifyTypedCode = async () => {
    setSending(true);

    const verifyResult = await  sendRequest("/api/verifyTypedCode",{
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mobile: mobile, code: codes }),
    })
   
    if(verifyResult.result){
      
    }
    console.log("verify Result is  : ", verifyResult);
  };
  return (
    <>
      {!sending && (
        <div className="codeVerifyWindow">
          Verify Code:
          <div className="codes">
            <input
              className="code"
              ref={code1Ref}
              value={code1}
              onChange={changeCode1}
              type={"number"}
              maxLength={1}
            />
            <input
              className="code"
              value={code2}
              ref={code2Ref}
              onChange={changeCode2}
              type={"number"}
              maxLength={1}
            />
            <input
              className="code"
              ref={code3Ref}
              value={code3}
              onChange={changeCode3}
              type={"number"}
              maxLength={1}
            />
            <input
              className="code"
              ref={code4Ref}
              value={code4}
              onChange={changeCode4}
              type={"number"}
              maxLength={1}
            />
          </div>
        </div>
      )}

      {sending && (
        <div>
          <CircularProgress />
          Verifying the code...
        </div>
      )}
    </>
  );
}
