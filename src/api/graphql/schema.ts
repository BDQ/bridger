import { gql } from "apollo-server";

const listenerFields = `
  name: String!
  busName: String
  eventPattern: JSONObject
`;

export const typeDefs = gql`
  scalar JSONObject

  type Bus {
    name: ID!
    arn: String
    account: Int
  }

  type Listener {
    id: ID!
    ${listenerFields}
    bus: Bus
    events: [Event]
  }

  input ListenerInput {
    ${listenerFields}
  }

  type Event {
    id: ID!
    listenerId: String
    source: String
    detailType: String
    detail: JSONObject
    resources: [String]
    time: String
  }

  type Query {
    bus(name: ID!): Bus
    buses: [Bus]
    listeners: [Listener]
    listener(id: ID!): Listener
    events(listenerId: ID!): [Event]
  }

  type Mutation {
    putListener(id: ID, listener: ListenerInput): Listener
    deleteListener(id: ID): Boolean
  }
`;
