import { GlobalConfig } from "@/config";
import { getRandomCode } from "./dataUtils";
import { getNow } from "./dateUtils";
import { findOneCollection, insertOneDoc } from "./mongoDataAPIs";



export const generateVerifyCode = async (identityNumber : any)=>{
      
    const foundVerifyCode = await  findOneCollection(GlobalConfig.databaseName,"verify_code",{mobile : identityNumber,used : false});

    console.log("find code is , ",foundVerifyCode)
    
    if(!foundVerifyCode){

        const verifyCode =  getRandomCode();
        await insertOneDoc(GlobalConfig.databaseName,"verify_code",{mobile : identityNumber,code :verifyCode ,used : false,createdTime : getNow()})
        
        return verifyCode;
    }
    else{
        return foundVerifyCode.code
    }
    
}

