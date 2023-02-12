import { GlobalConfig } from '@/config'
import { updateCollection } from '@/utils/mongoDataAPIs'
import type { NextApiRequest, NextApiResponse } from 'next'

// api purpose : when user try to match user, first to create a offer and write this offer to database, then waiting for other person to peer it
export default async function api_updateMasterOffer(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const {clientToken ,offer,lockedBy} = req.body
    await updateCollection(GlobalConfig.databaseName,"peerMatch",{clientToken},{lockedUserOffer : offer,lockedBy })

    res.status(200).send({result : 1})
}