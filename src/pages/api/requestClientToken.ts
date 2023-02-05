
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function api_generateClientToken(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    console.log("request body is ",req.body)
    // const verifyResult = await db_verifyTypedCode(req.body)
    // res.status(200).json(verifyResult)
  }
  