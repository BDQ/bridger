#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { DataStack } from "../stacks/data";
import { ApiStack } from "../stacks/api";

const app = new cdk.App();

const dataStack = new DataStack(app, "bridger-data");

new ApiStack(app, "bridger-api", {
  eventsTable: dataStack.eventsTable
});
