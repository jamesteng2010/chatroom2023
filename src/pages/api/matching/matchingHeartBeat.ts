import { GlobalConfig } from '@/config'
import { getNow } from '@/utils/dateUtils'
import { findOneCollection, insertOneDoc, updateCollection } from '@/utils/mongoDataAPIs'
import type { NextApiRequest, NextApiResponse } from 'next'

// api purpose : get one of  searching users and lock it.
export default async function api_matchingHeartBeat(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    
      try{
        const {clientToken} = req.body
        const self = await findOneCollection(GlobalConfig.databaseName,'peerMatch',{clientToken})
         updateCollection(GlobalConfig.databaseName,"peerMatch",{clientToken},{lastUpdate:getNow()})
        res.status(200).send(self)
      }
      catch(e){
        res.status(200).send({
          result:false,
          error :e
        })
      }
      
      
  }