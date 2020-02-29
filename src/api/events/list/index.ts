import { db } from "@persistence/client";
import { success } from "@shared/response";

export const handler = async (payload: any) => {
  const {
    pathParameters: { id }
  } = payload;

  const params = {
    TableName: process.env.EVENTS_TABLE || "bridger",
    KeyConditionExpression: "pk = :pk and sk BETWEEN :zero and :infinity",
    ExpressionAttributeValues: {
      ":pk": `lstnr#${id}`,
      ":zero": "0",
      ":infinity": "9999999999999999"
    }
  };

  console.log(params);
  const result = await db.query(params).promise();

  return {
    ...success,
    body: JSON.stringify(result)
  };
};
