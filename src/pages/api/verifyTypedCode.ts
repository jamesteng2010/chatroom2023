

import { GlobalConfig } from "@/config";
import AppContext from "@/context/userDataContext";


import { getNow } from "@/utils/dateUtils";
import { findOneCollection, insertOneDoc, updateCollection } from "@/utils/mongoDataAPIs";
import { getRandomStr } from "@/utils/strUtil";
import type { NextApiRequest, NextApiResponse } from "next";
import {useContext} from 'react'

export default async function SignUp_API(
  req: NextApiRequest,
  res: NextApiResponse
) {


    const {code,mobile} = req.body;
    const foundVerifyCode = await findOneCollection(GlobalConfig.databaseName,"verify_code",{mobile,code,used : false});
    console.log("found verify code is , ",foundVerifyCode);
    if(foundVerifyCode){

        await updateCollection(GlobalConfig.databaseName,"verify_code",{mobile,code},{used : true,usedTime : getNow()})
        const clientToken = getRandomStr(256)
        // start to generate client token 
        await insertOneDoc(GlobalConfig.databaseName,"clientToken",{mobile,clientToken})

        const foundUserInfo = await findOneCollection(GlobalConfig.databaseName,"userInfo",{mobile,blocked:false})
     
        res.status(200).json({userData : foundUserInfo,clientToken});
    }
    else{
        res.status(404).json({result : false});
    }

    
}