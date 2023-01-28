import { generateVerifyCode } from "@/utils/dbUtils";
import { sendRequest } from "@/utils/httpUtils";

export const db_userSignUp = async (userData: any) => {
  const verifyCode = await generateVerifyCode(userData.mobile);
  console.log("start to send sms")
  await sendRequest("https://rest.clicksend.com/v3/sms/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization:
        "Basic amFtZXN0ZW5nMjAxMEBnbWFpbC5jb206NjAwQUYwNDMtNDA2Ni1ERjk4LTFGNjMtMTVERDZEQkE4Qzc3",
    },
    body: JSON.stringify({
      messages: [
        {
          body: `verify code is :${verifyCode}`,
          to: userData.mobile,
          from: "VC",
        },
      ],
    }),
  });

  console.log("get verify code is ", verifyCode);
};
