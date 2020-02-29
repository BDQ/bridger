import { db } from "@persistence/client";
import { Event } from "@models/event";

import log from "@shared/logger";

export const handler = async (payload: any) => {
  console.log(payload);

  const params = Event.put({
    ...payload,
    sortTime: Date.parse(payload.time)
  });

  console.log(params);

  const result = await db.put(params).promise();
  log.info(result, "hello");

  return JSON.stringify({ status: 200, body: "ok" });
};
