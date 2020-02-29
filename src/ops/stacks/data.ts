import * as cdk from "@aws-cdk/core";
import dynamodb = require("@aws-cdk/aws-dynamodb");

export class DataStack extends cdk.Stack {
  public readonly eventsTable: dynamodb.Table;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.eventsTable = new dynamodb.Table(this, "events", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
    });
  }
}
