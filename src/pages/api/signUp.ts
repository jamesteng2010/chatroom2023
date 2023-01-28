import { db_userSignUp } from '@/dbservices/userdb.service'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function SignUp_API(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    console.log("request body is ",req.body)
    await db_userSignUp(req.body)
    res.status(200).json({ name: 'John Doe' })
  }
  