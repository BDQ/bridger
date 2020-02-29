import ApolloClient from "apollo-boost";
import { baseFetch } from "./config";

export const client = new ApolloClient({
  uri: "API_URL",
  headers: baseFetch.headers
});
