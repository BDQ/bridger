import EventBridge from "aws-sdk/clients/eventbridge";
import { GraphQLResolveInfo } from "graphql";
const eventBridge = new EventBridge();

export const bus = async (
  { busName }: any,
  { name }: any,
  __: any,
  info: GraphQLResolveInfo
) => {
  let arnRequested = true;

  if (info.fieldNodes.length === 1) {
    const { selectionSet } = info.fieldNodes[0];

    arnRequested =
      selectionSet?.selections.some((sel: any) => sel.name.value === "arn") ||
      false;
  }

  if (arnRequested) {
    const params = { Name: busName || name };
    const bus = await eventBridge.describeEventBus(params).promise();
    return { name: bus.Name, arn: bus.Arn };
  } else {
    return { name: busName || name };
  }
};

export const buses = async () => {
  const result = await eventBridge.listEventBuses().promise();
  return result.EventBuses?.map(bus => ({ name: bus.Name }));
};
