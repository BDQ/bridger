import { db } from "@persistence/client";
import { Event } from "@models/Event";

export const events = async (listenerId: string) => {
  const params = {
    TableName: process.env.BRIDGER_TABLE || "bridger",
    KeyConditionExpression: "pk = :pk and sk BETWEEN :zero and :infinity",
    ExpressionAttributeValues: {
      ":pk": `lstnr#${listenerId}`,
      ":zero": "0",
      ":infinity": "9999999999999999"
    },
    ScanIndexForward: false //descending events
  };

  console.log(params);
  const result = await db.query(params).promise();
  return result.Items?.map(item => Event.parse(item));
};
