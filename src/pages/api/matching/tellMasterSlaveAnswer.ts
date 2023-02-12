import { GlobalConfig } from "@/config";
import { getNow } from "@/utils/dateUtils";
import { updateCollection } from "@/utils/mongoDataAPIs";
import type { NextApiRequest, NextApiResponse } from "next";

// api purpose : get one of  searching users and lock it.
export default async function api_matchingHeartBeat(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { lockedBy, answer } = req.body;
  await updateCollection(
    GlobalConfig.databaseName,
    "peerMatch",
    { lockedBy },
    { slaveAnswer: answer, answerTime: getNow() }
  );
  res.status(200).send({ result: 1 });
}
