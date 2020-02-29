import EventBridge from "aws-sdk/clients/eventbridge";
const eventBridge = new EventBridge();
import short from "short-uuid";

import { db } from "@persistence/client";
import { Listener } from "@models/listener";

// used to decorate the EB event with the spy id that's tracking
const InputPathsMap = {
  id: "$.id",
  time: "$.time",
  detail: "$.detail",
  detailType: "$.detail-type",
  source: "$.source",
  resources: "$.resources"
};

export const listeners = async () => {
  const params = {
    TableName: process.env.BRIDGER_TABLE || "bridger",
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": "lstnr"
    }
  };

  const result = await db.query(params).promise();

  return result.Items?.map(item => Listener.parse(item));
};

export const listener = async (_: any, { id }: any) => {
  let params = Listener.get({ id });
  console.log(params);

  const result = await db.get(params).promise();
  return Listener.parse(result.Item);
};

export const deleteListener = async (_: any, args: any) => {
  const { id } = args;

  const params = Listener.get({ id });
  console.log(params);
  const result = await db.delete(params).promise();

  return Object.keys(result).length === 0;
};

export const putListener = async (_: any, args: any) => {
  const { id = short.generate(), listener } = args;

  const params = Listener.put({
    id,
    ...listener
  });
  console.log(params);
  const result = await db.put(params).promise();
  console.log(result);

  const Name = `bridger-rule-${id}`;

  const EventBusName = listener.busName || "default";
  const ruleResp = await eventBridge
    .putRule({
      Name,
      EventPattern: JSON.stringify(listener.eventPattern),
      EventBusName
    })
    .promise();
  console.log(ruleResp);

  const InputTemplate = `{"listenerId": "${id}", "id": <id>, "detail": <detail>, "time": <time>, "detailType": <detailType>, "source": <source>, "resources": <resources>}`;

  const targetResp = await eventBridge
    .putTargets({
      Rule: Name,
      EventBusName,
      Targets: [
        {
          Id: `target-${id}-1`,
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
};
