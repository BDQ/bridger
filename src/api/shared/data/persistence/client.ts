import { DocumentClient } from "aws-sdk/clients/dynamodb";

export const db = new DocumentClient({
  convertEmptyValues: true,
  maxRetries: 3,
  httpOptions: {
    timeout: 10000,
    connectTimeout: 10000
  }
});
