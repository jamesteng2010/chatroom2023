import { GlobalConfig } from '@/config';
import { getTimeBetweenNow } from '@/utils/dateUtils';
import { sleep } from '@/utils/httpUtils'
import { deleteCollections } from '@/utils/mongoDataAPIs';
import type { NextApiRequest, NextApiResponse } from 'next'

// result : -1 , mobile found but no user found
//          -2 , token not found
//          1 : user found by the token 
export default async function api_cleanNotActiveUsers(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    loopCleanUsers();
    res.status(200).send({})
  }
  const loopCleanUsers = async ()=>{
      console.log("clean Users....")
      const deleteConditions = {lastUpdate : {$lt : getTimeBetweenNow("seconds",-30)}}
      deleteCollections(GlobalConfig.databaseName,"peerMatch",deleteConditions)
      await sleep(3000)
      loopCleanUsers();
  }