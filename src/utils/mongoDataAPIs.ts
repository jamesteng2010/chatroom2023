import { GlobalConfig } from "@/config";
import { sendRequest } from "./httpUtils";
import { getRandomStr } from "./strUtil";

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "api-key": GlobalConfig.mongoDataAPI_key,
};
const getRequestCommonPart = (database: string, collection: string) => {
  return {
    collection: collection,
    database: database,
    dataSource: "Cluster0",
  };
};

export const findCollecction = async (
  database: string,
  collection: string,
  filter: any,
  sort: any
) => {
  return sendRequest(`${GlobalConfig.mongoDataAPI}find`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...getRequestCommonPart(database, collection),
      filter: filter,
    }),
  });
};

export const findOneCollection = async (
  database: string,
  collection: string,
  filter: any,
  projection? : any
) => {
  const returnResult = await sendRequest(`${GlobalConfig.mongoDataAPI}findOne`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...getRequestCommonPart(database, collection),
      filter: filter,
      projection : {...projection,"_id":0}
    }),
  });
  if(returnResult){
    return returnResult.document
  }
};

export const updateCollection = async (
  database: string,
  collection: string,
  filter: any,
  updatedValues: any
) => {
  return sendRequest(`${GlobalConfig.mongoDataAPI}updateOne`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...getRequestCommonPart(database, collection),
      filter: filter,
      update: {
        $set: updatedValues,
      },
    }),
  });
};

export const insertOneDoc = async (
  database: string,
  collection: string,
  document: any
) => {
  return sendRequest(`${GlobalConfig.mongoDataAPI}insertOne`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...getRequestCommonPart(database, collection),
      document: document,
    }),
  });
};
