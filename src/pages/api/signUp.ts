import type { NextApiRequest, NextApiResponse } from 'next'

export default function SignUp_API(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    console.log("request body is ",req.body)
    res.status(200).json({ name: 'John Doe' })
  }
  