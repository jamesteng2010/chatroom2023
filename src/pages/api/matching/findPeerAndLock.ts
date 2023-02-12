
import { GlobalConfig } from '@/config'
import { getDiffFromNow, getTimeBetweenNow } from '@/utils/dateUtils'
import { sleep } from '@/utils/httpUtils'
import { deleteCollections, deleteOneCollection, findCollecction, findOneCollection, insertOneDoc, updateCollection } from '@/utils/mongoDataAPIs'
import type { NextApiRequest, NextApiResponse } from 'next'

// api purpose : get one of  searching users and lock it.
export default async function api_findPeerAndLock(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const {clientToken} = req.body
       
        const foundPeer = await getAvialablePeer(clientToken)

        res.status(200).send(foundPeer)
        
  }
  
  const getAvialablePeer:any = async(clientToken:any)=>{
    const findResult :any = await findOneCollection(GlobalConfig.databaseName,"peerMatch",{clientToken})

    if(getDiffFromNow(findResult.lastUpdate,'seconds')<30){
      if(!findResult.lockedBy){
        console.log("user is not locked by any person, so keep searching....",clientToken)
       
        
        const foundPeer = await findOneCollection(GlobalConfig.databaseName,"peerMatch",{clientToken :{$ne : clientToken},status : 'searching'})

        if(foundPeer){
          console.log("found peer : ",foundPeer)
          await updateCollection(GlobalConfig.databaseName,"peerMatch",{clientToken : foundPeer.clientToken},{status : 'matched',lockedBy :clientToken,lockedUserOffer : foundPeer.offer })
          return foundPeer
        }
        else{
          await sleep(500)
          return getAvialablePeer(clientToken)
        }
      }

      // if locked by user , then need to return user 
      else{
        console.log("user is locked by ====>",findResult.lockedBy)
        return {locked : 1,offer : findResult.lockedUserOffer}
      }
       
        
    }
    else{
      deleteOneCollection(GlobalConfig.databaseName,"peerMatch",{clientToken})
      return {noResult : 1}
    }

 
    
  }  