
import { GlobalConfig } from '@/config'
import { getNow } from '@/utils/dateUtils'
import { findOneCollection, insertOneDoc, updateCollection } from '@/utils/mongoDataAPIs'
import type { NextApiRequest, NextApiResponse } from 'next'

// api purpose : when user try to match user, first to create a offer and write this offer to database, then waiting for other person to peer it
export default async function api_writeMasterOffer(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
        try{
            const {offerInfo} = req.body
            const existingPeerMatch = await findOneCollection(GlobalConfig.databaseName,'peerMatch',{clientToken : offerInfo.clientToken})
            if(!existingPeerMatch){
                await insertOneDoc(GlobalConfig.databaseName,"peerMatch",offerInfo)
            }
            else{
                updateCollection(GlobalConfig.databaseName,"peerMatch",{clientToken : offerInfo.clientToken},{...offerInfo,role : null,lockedBy : null , answerTime : null,slaveAnswer : null})
            }
            insertOneDoc(GlobalConfig.databaseName,"peerHistory",{clientToken : offerInfo.clientToken,time : getNow()})
           
            res.status(200).send({result : true})
        }
        catch(e){
            res.status(200).send({result : false,error : e})
        }
        
  }