
import { GlobalConfig } from '@/config';
import { findOneCollection } from '@/utils/mongoDataAPIs';
import { parseCookie } from '@/utils/strUtil';
import type { NextApiRequest, NextApiResponse } from 'next'

// result : -1 , mobile found but no user found
//          -2 , token not found
//          1 : user found by the token 
export default async function api_getUserInfoByClientToken(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    
    const headers = req.headers;
    const {clientToken} = parseCookie(headers?.cookie as string)
    console.log(clientToken)
    const foundMobile = await findOneCollection(GlobalConfig.databaseName,"clientToken",{clientToken},{mobile:1})
    if(foundMobile){
        const foundUser = await findOneCollection(GlobalConfig.databaseName,"user",{mobile : foundMobile.mobile})
        if(foundUser){
            res.status(200).json({result : 1,foundUser})
        }
        else{
            res.status(200).json({result : -1})
        }
        
        
    }
    else{
        res.status(200).json({result : -2})
    }
    res.status(404).json({notFound:true})

  }
  