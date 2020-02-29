import * as cdk from "@aws-cdk/core";
import lambda = require("@aws-cdk/aws-lambda");
import iam = require("@aws-cdk/aws-iam");
import dynamodb = require("@aws-cdk/aws-dynamodb");
import path = require("path");

import apigateway = require("@aws-cdk/aws-apigateway");
import { AwsCustomResource } from "@aws-cdk/custom-resources";

export interface ApiStackProps extends cdk.StackProps {
  eventsTable: dynamodb.Table;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const basePath = path.join(__dirname, "../../../api/dist/lambdas");

    const apiGW = new apigateway.RestApi(this, "bridger-api", {
      deployOptions: {
        tracingEnabled: false
      },
      apiKeySourceType: apigateway.ApiKeySourceType.HEADER,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowCredentials: true,
        allowHeaders: ["content-type", "x-api-key"],
        maxAge: cdk.Duration.hours(24)
      }
    });

    const processIncoming = new lambda.Function(this, "process-incoming", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(basePath, "processIncoming")),
      timeout: cdk.Duration.seconds(60),
      tracing: lambda.Tracing.DISABLED,
      memorySize: 2048,
      environment: {
        EVENTS_TABLE: props.eventsTable.tableName
      }
    });

    processIncoming.addPermission("rule-invoke-id", {
      action: "lambda:InvokeFunction",
      principal: new iam.ServicePrincipal("events.amazonaws.com"),
      sourceArn: "arn:aws:events:us-east-1:409779713686:*"
    });
    props.eventsTable.grantReadWriteData(processIncoming);

    const graphQL = new lambda.Function(this, "graphql", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(basePath, "graphql")),
      timeout: cdk.Duration.seconds(90),
      tracing: lambda.Tracing.DISABLED,
      memorySize: 2048,
      environment: {
        BRIDGER_TABLE: props.eventsTable.tableName
      }
    });
    props.eventsTable.grantReadWriteData(graphQL);

    graphQL.addToRolePolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["events:ListEventBuses"]
      })
    );

    const graphQLInteg = new apigateway.LambdaIntegration(graphQL);
    const graphQLRoute = apiGW.root.addResource("graph");
    graphQLRoute.addMethod("POST", graphQLInteg, { apiKeyRequired: true });
    graphQLRoute.addMethod("GET", graphQLInteg, {});

    const putListener = new lambda.Function(this, "put-listener", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(basePath, "putListeners")),
      timeout: cdk.Duration.seconds(60),
      tracing: lambda.Tracing.DISABLED,
      memorySize: 512,
      environment: {
        EVENTS_TABLE: props.eventsTable.tableName,
        PROCESS_INCOMING_ARN: processIncoming.functionArn
      }
    });
    props.eventsTable.grantReadWriteData(putListener);

    putListener.addToRolePolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["events:PutRule", "events:PutTargets"]
      })
    );
    const putListenerInteg = new apigateway.LambdaIntegration(putListener);
    const listenersRoute = apiGW.root.addResource("listeners");
    listenersRoute.addMethod("POST", putListenerInteg, {
      apiKeyRequired: true
    });

    const listenerRoute = listenersRoute.addResource("{id}");
    listenerRoute.addMethod("PUT", putListenerInteg, { apiKeyRequired: true });

    const readListener = new lambda.Function(this, "read-listener", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(basePath, "readListener")),
      timeout: cdk.Duration.seconds(60),
      tracing: lambda.Tracing.DISABLED,
      memorySize: 512,
      environment: {
        EVENTS_TABLE: props.eventsTable.tableName,
        PROCESS_INCOMING_ARN: processIncoming.functionArn
      }
    });
    props.eventsTable.grantReadData(readListener);

    const readListenerInteg = new apigateway.LambdaIntegration(readListener);
    listenerRoute.addMethod("GET", readListenerInteg, {
      apiKeyRequired: true
    });

    const listEvents = new lambda.Function(this, "list-events", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(basePath, "listEvents")),
      timeout: cdk.Duration.seconds(60),
      tracing: lambda.Tracing.DISABLED,
      memorySize: 512,
      environment: {
        EVENTS_TABLE: props.eventsTable.tableName
      }
    });
    props.eventsTable.grantReadData(listEvents);
    const listEventsInteg = new apigateway.LambdaIntegration(listEvents);

    const eventsRoute = listenerRoute.addResource("events");
    eventsRoute.addMethod("GET", listEventsInteg, {
      apiKeyRequired: true
    });

    const plan = apiGW.addUsagePlan("DefaultUsagePlan", {
      name: "Default",
      description: "Default usage plan for Bridger API"
    });
    const apiKey = apiGW.addApiKey("uiAPIKey");
    plan.addApiKey(apiKey);
    plan.addApiStage({
      stage: apiGW.deploymentStage
    });

    // $ aws apigateway  get-api-key --api-key=fbux2vkaoj --include-value
    const getParameter = new AwsCustomResource(this, "GetAPIKey", {
      onUpdate: {
        // will also be called for a CREATE event
        service: "APIGateway",
        action: "getApiKey",
        parameters: {
          apiKey: apiKey.keyId,
          includeValue: true
        },
        physicalResourceIdPath: "id"
      },
      policyStatements: [
        new iam.PolicyStatement({
          resources: ["*"], //apiGW.restApiRootResourceId],
          actions: ["apigateway:GetApiKey", "apigateway:GET"]
        })
      ]
    });

    new cdk.CfnOutput(this, "KEYME", {
      value: getParameter.getDataString("value")
    });
  }
}
