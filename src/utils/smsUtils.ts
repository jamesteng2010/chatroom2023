import { sendRequest } from "./httpUtils"

export const sendSMSToMobile = (mobile:any,message : any)=>{
    sendRequest('https://rest.clicksend.com/v3/sms/send',{
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Authorization": "Basic amFtZXN0ZW5nMjAxMEBnbWFpbC5jb206NjAwQUYwNDMtNDA2Ni1ERjk4LTFGNjMtMTVERDZEQkE4Qzc3"
        },
        body: JSON.stringify( {"messages": [
            {
              "body": message,
              "to": mobile,
              "from": "VC"
            }
          ]}),
    })
}