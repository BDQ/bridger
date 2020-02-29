import EventBridge from "aws-sdk/clients/eventbridge";
const eventBridge = new EventBridge();

import { db } from "@persistence/client";
import { Listener } from "@models/listener";

import { success } from "@shared/response";

import short from "short-uuid";

// used to decorate the EB event with the spy id that's tracking
const InputPathsMap = {
  id: "$.id",
  time: "$.time",
  detail: "$.detail",
  detailType: "$.detail-type",
  source: "$.source",
  resources: "$.resources"
};

export const handler = async (event: any) => {
  console.log(event);
  const { pathParameters, body } = event;
  const listenerId = pathParameters ? pathParameters.id : short.generate();

  const { eventPattern } = JSON.parse(body);

  console.log({ listenerId, eventPattern });
  const params = Listener.put({
    listenerId,
    eventPattern
  });
  console.log(params);
  const result = await db.put(params).promise();
  console.log(result);

  const Name = `bridger-rule-${listenerId}`;

  const EventBusName = "c8lmasterhooksvendor82589E1C";
  const ruleResp = await eventBridge
    .putRule({
      Name,
      EventPattern: JSON.stringify(eventPattern),
      EventBusName
    })
    .promise();
  console.log(ruleResp);

  const InputTemplate = `{"listenerId": "${listenerId}", "id": <id>, "detail": <detail>, "time": <time>, "detailType": <detailType>, "source": <source>, "resources": <resources>}`;

  const targetResp = await eventBridge
    .putTargets({
      Rule: Name,
      EventBusName,
      Targets: [
        {
          Id: `target-${listenerId}-1`,
          Arn: process.env.PROCESS_INCOMING_ARN || "fake",
          InputTransformer: {
            InputPathsMap,
            InputTemplate
          }
        }
      ]
    })
    .promise();

  console.log(targetResp);

  return {
    ...success,
    body: JSON.stringify({ listenerId })
  };
};
