import { Model } from "dynamodb-toolbox";

export const Event = new Model("Event", {
  table: process.env.BRIDGER_TABLE || process.env.EVENTS_TABLE,
  partitionKey: "pk",
  sortKey: "sk",

  schema: {
    pk: { type: "string", hidden: true },
    sk: { type: "string", hidden: true },

    prefix: ["pk", 0, { default: "lstnr", hidden: true }],
    listenerId: ["pk", 1, { required: "always" }],

    sortTime: ["sk", 0, { required: "always" }],
    id: ["sk", 1, { required: "always" }],

    detail: { type: "map", required: true },
    detailType: { type: "string", required: true },
    source: { type: "string" },
    resources: { type: "list" },
    time: { type: "string" }
  }
});
