import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import path from "path";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigateway from "@aws-cdk/aws-apigatewayv2-alpha";
import * as apigatewayIntegrations from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53targets from "aws-cdk-lib/aws-route53-targets";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { PayloadFormatVersion } from "@aws-cdk/aws-apigatewayv2-alpha";

const HOSTED_ZONE = "mattb.tech";
const HOSTED_ZONE_ID = "Z2GPSB1CDK86DH";
const DOMAIN_NAME = "oauth.api.mattb.tech";

export class Oauth extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "Zone",
      {
        hostedZoneId: HOSTED_ZONE_ID,
        zoneName: HOSTED_ZONE,
      }
    );

    const tokenTable = new dynamodb.Table(this, "TokenTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: "Source",
        type: dynamodb.AttributeType.STRING,
      },
    });

    const lambdaFunction = new lambda.NodejsFunction(this, "LambdaFunction", {
      entry: path.join(__dirname, "../../oauth/dist/index.js"),
      handler: "handler",
      bundling: {
        target: "es2020",
        environment: {
          NODE_ENV: "production",
        },
      },
      runtime: Runtime.NODEJS_14_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(20),
    });

    lambdaFunction.addEnvironment("TOKEN_TABLE", tokenTable.tableName);
    tokenTable.grantFullAccess(lambdaFunction);

    const api = new apigateway.HttpApi(this, "Api", {
      defaultIntegration: new apigatewayIntegrations.HttpLambdaIntegration(
        "GraphQLApiIntegration",
        lambdaFunction
      ),
    });

    const certificate = new acm.DnsValidatedCertificate(this, "Certificate", {
      domainName: DOMAIN_NAME,
      hostedZone,
    });

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
        origin: new origins.HttpOrigin(
          `${api.httpApiId}.execute-api.${this.region}.amazonaws.com`,
          {
            httpsPort: 443,
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
          }
        ),
      },
      certificate,
      domainNames: [DOMAIN_NAME],
    });

    new route53.ARecord(this, "DomainRecord", {
      zone: hostedZone,
      recordName: DOMAIN_NAME,
      ttl: cdk.Duration.minutes(5),
      target: route53.RecordTarget.fromAlias(
        new route53targets.CloudFrontTarget(distribution)
      ),
    });
  }
}