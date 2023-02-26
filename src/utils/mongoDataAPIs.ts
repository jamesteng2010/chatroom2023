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


export const deleteOneCollection = async (
  database: string,
  collection: string,
  filter: any
) => {
  return sendRequest(`${GlobalConfig.mongoDataAPI}deleteOne`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...getRequestCommonPart(database, collection),
      filter: filter,
    }),
  });
};


export const deleteCollections = async (
  database: string,
  collection: string,
  filter: any
) => {
  return sendRequest(`${GlobalConfig.mongoDataAPI}deleteMany`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...getRequestCommonPart(database, collection),
      filter: filter,
    }),
  });
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
  const returnResult = await sendRequest(`${GlobalConfig.backendAPI.host}findOneCollection`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...getRequestCommonPart(database, collection),
      filter: filter,
      projection : {...projection,"_id":0}
    }),
  });
  console.log(returnResult)
  if(!returnResult.error){
    return returnResult
  }
  else{
    return null
  }
};

export const updateCollection = async (
  database: string,
  collection: string,
  filter: any,
  updatedValues: any
) => {
  return sendRequest(`${GlobalConfig.backendAPI.host}updateOneCollection`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...getRequestCommonPart(database, collection),
      filter: filter,
      updateValues: updatedValues,
      
    }),
  });
};

export const insertOneDoc = async (
  database: string,
  collection: string,
  document: any
) => {
  return sendRequest(`${GlobalConfig.backendAPI.host}insertOneCollection`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...getRequestCommonPart(database, collection),
      document: document,
    }),
  });
};
