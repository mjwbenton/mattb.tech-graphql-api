import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import path from "path";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as apigateway from "@aws-cdk/aws-apigatewayv2";
import * as iam from "@aws-cdk/aws-iam";

export class MattbTechGraphQlApi extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cacheTable = new dynamodb.Table(this, "CacheTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: "CacheKey",
        type: dynamodb.AttributeType.STRING
      },
      timeToLiveAttribute: "CacheTTL"
    });

    const lambdaFuntion = new lambda.Function(this, "LambdaFunction", {
      code: new lambda.AssetCode(path.join(__dirname, "../../graphql-lambda")),
      handler: "src/index.handler",
      runtime: lambda.Runtime.NODEJS_12_X
    });

    lambdaFuntion.addEnvironment("CACHE_TABLE", cacheTable.tableName);
    cacheTable.grantFullAccess(lambdaFuntion);

    const api = new apigateway.CfnApi(this, "HttpEndpoint", {
      name: "GraphQL HTTP API",
      protocolType: "HTTP",
      target: lambdaFuntion.functionArn,
      corsConfiguration: {
        allowHeaders: ["Content-Type"],
        allowMethods: ["*"],
        allowOrigins: ["*"],
        allowCredentials: false
      }
    });

    lambdaFuntion.addPermission("allowApiGateway", {
      principal: new iam.ServicePrincipal("apigateway.amazonaws.com"),
      sourceArn: cdk.Arn.format(
        {
          service: "execute-api",
          resource: api.ref,
          resourceName: "*"
        },
        this
      )
    });
  }
}
