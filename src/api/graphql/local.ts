process.env.BRIDGER_TABLE = "bridger-data-events26E65764-UDRBUY5CPY5B";

import { ApolloServer, gql } from "apollo-server";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
