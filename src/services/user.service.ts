import { sendRequest } from "@/utils/httpUtils"
export const signUpForUser = (userData : any)=>{
    console.log(userData)
    sendRequest("/api/signUp",{
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
}
