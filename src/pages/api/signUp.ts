
import { generateVerifyCode } from "@/utils/dbUtils";
import { sendRequest } from "@/utils/httpUtils";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function SignUp_API(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("request body is ", req.body);
  const { mobile } = req.body;
  const verifyCode = await generateVerifyCode(mobile);

  console.log("start to send sms");
    // await sendRequest("https://rest.clicksend.com/v3/sms/send", {
    //   method: "POST",
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    //     Authorization:
    //       "Basic amFtZXN0ZW5nMjAxMEBnbWFpbC5jb206NjAwQUYwNDMtNDA2Ni1ERjk4LTFGNjMtMTVERDZEQkE4Qzc3",
    //   },
    //   body: JSON.stringify({
    //     messages: [
    //       {
    //         body: `verify code is :${verifyCode}`,
    //         to:  mobile,
    //         from: "VIDEOCHAT",
    //       },
    //     ],
    //   }),
    // });

  console.log("get verify code is ", verifyCode);

  res.status(200).json({ name: "John Doe" });
}
