import { ApolloServer, gql } from "apollo-server-lambda";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true
});

exports.handler = server.createHandler({
  cors: {
    origin: "*",
    credentials: true
  }
});
