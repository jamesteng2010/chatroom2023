import { GlobalConfig } from "@/config";
import { sendRequest } from "@/utils/httpUtils";
import { deleteOneCollection } from "@/utils/mongoDataAPIs";
import type { NextApiRequest, NextApiResponse } from "next";

// api purpose : get one of  searching users and lock it.
export default async function api_removePeerMatch(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { clientToken } = req.body;
  const removeURL = `${GlobalConfig.backendAPI.host}removeFromPeerMatch`;

  const removeResult = await sendRequest(removeURL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientToken,
    }),
  });

  res.status(200).send(removeResult);
}
