import { GlobalConfig } from '@/config'
import { deleteOneCollection } from '@/utils/mongoDataAPIs'
import type { NextApiRequest, NextApiResponse } from 'next'

// api purpose : get one of  searching users and lock it.
export default async function api_findPeerAndLock(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const {clientToken} = req.body
    await  deleteOneCollection(GlobalConfig.databaseName,"peerMatch",{clientToken})
    res.status(200).send({result:true})
  }