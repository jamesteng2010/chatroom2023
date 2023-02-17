import { GlobalConfig } from '@/config';
import { sendRequest } from '@/utils/httpUtils';
import type { NextApiRequest, NextApiResponse } from 'next'

// api purpose : when user try to match user, first to create a offer and write this offer to database, then waiting for other person to peer it
export default async function api_insertSearchingPeer(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    
    const mate = {...req.body,}
    
    const insertURL = `${GlobalConfig.backendAPI.host}insertSearchMate`
    console.log("insert url is , ",insertURL)
    const createOfferResult = await sendRequest(
        insertURL ,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mate),
        }
      );
    
    res.status(200).send(createOfferResult)
}