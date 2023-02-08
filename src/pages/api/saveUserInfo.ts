

import { GlobalConfig } from '@/config';
import { getNow } from '@/utils/dateUtils';
import { findOneCollection, insertOneDoc } from '@/utils/mongoDataAPIs';
import { parseCookie } from '@/utils/strUtil';
import type { NextApiRequest, NextApiResponse } from 'next'

// result : -1 , mobile found but no user found
//          -2 , token not found
//          1 : user found by the token 
export default async function api_saveUserInfo(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const userData = req.body
    const headers = req.headers;
    const {clientToken} = parseCookie(headers?.cookie as string)
    const foundMobile = await findOneCollection(GlobalConfig.databaseName,"clientToken",{clientToken},{mobile:1}) 
    const wholeUserData = {...userData, mobile : foundMobile.mobile,createdDate : getNow(),blocked : false}
    const insertUserResult = await insertOneDoc(GlobalConfig.databaseName,"user",wholeUserData)
    res.status(200).json({result : true})
  }