import { generateVerifyCode } from "@/utils/dbUtils"
import { sendSMSToMobile } from "@/utils/smsUtils"
export const db_userSignUp = async (userData:any)=>{
    const verifyCode = await generateVerifyCode(userData.mobile)
    sendSMSToMobile(userData.mobile,`verify code is :${verifyCode}`)
    console.log("get verify code is ",verifyCode)
}