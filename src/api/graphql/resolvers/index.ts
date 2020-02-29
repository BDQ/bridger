import { GraphQLJSONObject } from "graphql-type-json";

import { events } from "./events";
import { bus, buses } from "./bus";
import { listener, listeners, putListener, deleteListener } from "./listeners";

export const resolvers = {
  Query: {
    bus,
    buses,
    listener,
    listeners,
    events: async (_: any, { listenerId }: any) => events(listenerId) // pass parent listener i
  },
  Listener: {
    bus: bus,
    events: async ({ id }: any) => events(id) // pass parent listener i
  },
  JSONObject: GraphQLJSONObject,
  Mutation: {
    putListener,
    deleteListener
  }
};
