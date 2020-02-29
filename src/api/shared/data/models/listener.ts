import { Model } from "dynamodb-toolbox";

export const Listener = new Model("Listener", {
  table: process.env.BRIDGER_TABLE || process.env.EVENTS_TABLE,
  partitionKey: "pk",
  sortKey: "sk",

  schema: {
    pk: { type: "string", hidden: true },
    sk: { type: "string", hidden: true },

    prefix: ["pk", 0, { default: "lstnr", hidden: true }],

    id: ["sk", 0, { type: "string" }],
    suffix: ["sk", 1, { default: "config", hidden: true }],

    name: { type: "string", required: true },
    busName: { type: "string", default: "default" },
    eventPattern: { type: "map" }
  }
});
