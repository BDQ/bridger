import { db } from "@persistence/client";

import { success } from "@shared/response";

export const handler = async (event: any) => {
  const {
    pathParameters: { id }
  } = event;

  const params = {
    TableName: process.env.EVENTS_TABLE || "bridger",
    Key: { pk: `lstnr#${id}`, sk: "config" }
  };

  console.log(params);
  const result = await db.get(params).promise();

  return {
    ...success,
    body: JSON.stringify(result.Item)
  };
};
