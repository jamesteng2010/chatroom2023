// this schedule api purpose is to loop all matched peer and set them roles as master and slave
// why doing this , reason :
//                          1. when front end user click search , they locked by some user , but same time , this user also might lock other use

// so this schedule api run as single thread in the backend to get all 'matched' records and pair them 
import { GlobalConfig } from '@/config'
import { findOneCollection, updateCollection } from '@/utils/mongoDataAPIs'
import type { NextApiRequest, NextApiResponse } from 'next'
export default async function api_cleanNotActiveUsers(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
        processMatchedRecord();
        res.status(200).send("running")
  }

  const processMatchedRecord = async ()=>{
    const matchedRecord = await findOneCollection(GlobalConfig.databaseName,"peerMatch",{status : "matched"});
    if(matchedRecord){
        await updateCollection(GlobalConfig.databaseName,'peerMatch',{clientToken : matchedRecord.clientToken},{role : 'master',status : 'peering'})
        
        await updateCollection(GlobalConfig.databaseName,'peerMatch',{clientToken:matchedRecord.lockedBy},{status : 'peering',role:'slave',lockedBy : null,lockedUserOffer : null})
    }
    processMatchedRecord()
  }