import { GlobalConfig } from '@/config'
import { sendRequest } from '@/utils/httpUtils';
import { deleteOneCollection } from '@/utils/mongoDataAPIs'
import type { NextApiRequest, NextApiResponse } from 'next'

// api purpose : get one of  searching users and lock it.
export default async function api_removePeerMatch(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const {clientToken} = req.body

    const removeResult = await deleteOneCollection(GlobalConfig.databaseName,"peerMatch",{$or : [{clientToken : clientToken},{lockedBy : clientToken}]})
     
    res.status(200).send(removeResult)
  }