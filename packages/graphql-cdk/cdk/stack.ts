import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import path from "path";
//import * as apigateway from "@aws-cdk/aws-apigateway";
//import * as dynamodb from "@aws-cdk/aws-dynamodb";

export class MattbTechGraphQlApi extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new lambda.Function(this, "GraphqlApi", {
      code: new lambda.AssetCode(path.join(__dirname, "../../graphql-lambda")),
      handler: "src/index.handler",
      runtime: lambda.Runtime.NODEJS_12_X
    });
  }
}
