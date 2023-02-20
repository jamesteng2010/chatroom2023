import { GlobalConfig } from '@/config';
import { sendRequest } from '@/utils/httpUtils';
import { insertOneDoc } from '@/utils/mongoDataAPIs';
import type { NextApiRequest, NextApiResponse } from 'next'

// api purpose : when user try to match user, first to create a offer and write this offer to database, then waiting for other person to peer it
export default async function api_insertSearchingPeer(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    
    const mate = {...req.body,}
    
    const insertURL = `${GlobalConfig.backendAPI.host}insertSearchMate`
    console.log("insert url is , ",insertURL)
    const insertResult = await insertOneDoc(GlobalConfig.databaseName,"peerMatch",mate)
    res.status(200).send(insertResult)
}