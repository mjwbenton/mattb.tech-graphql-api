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
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  CorsHttpMethod,
  PayloadFormatVersion,
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { CloudFrontAllowedCachedMethods } from "aws-cdk-lib/aws-cloudfront";
import { Duration } from "aws-cdk-lib";
import { ITable } from "aws-cdk-lib/aws-dynamodb";

const HOSTED_ZONE = "mattb.tech";
const HOSTED_ZONE_ID = "Z2GPSB1CDK86DH";
const DOMAIN_NAME = "api.mattb.tech";

interface ApiProps extends cdk.StackProps {
  oauthTable: ITable;
}

export class Api extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "Zone",
      {
        hostedZoneId: HOSTED_ZONE_ID,
        zoneName: HOSTED_ZONE,
      }
    );

    const cacheTable = new dynamodb.Table(this, "CacheTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: "CacheKey",
        type: dynamodb.AttributeType.STRING,
      },
      timeToLiveAttribute: "CacheTTL",
    });

    const lambdaFunction = new lambda.NodejsFunction(this, "LambdaFunction", {
      entry: path.join(__dirname, "../../api-lambda/dist/index.js"),
      handler: "handler",
      bundling: {
        target: "es2020",
        environment: {
          NODE_ENV: "production",
        },
        commandHooks: {
          beforeBundling: () => [],
          beforeInstall: () => [],
          afterBundling(inputDir: string, outputDir: string): string[] {
            return [`cp ${inputDir}/api-lambda/.env ${outputDir}`];
          },
        },
      },
      runtime: Runtime.NODEJS_14_X,
      memorySize: 1024,
      timeout: Duration.seconds(20),
    });

    lambdaFunction.addEnvironment("CACHE_TABLE", cacheTable.tableName);
    cacheTable.grantFullAccess(lambdaFunction);

    lambdaFunction.addEnvironment("OAUTH_TABLE", props.oauthTable.tableName);
    props.oauthTable.grantReadData(lambdaFunction);

    const api = new apigateway.HttpApi(this, "GraphQLApi", {
      defaultIntegration: new apigatewayIntegrations.HttpLambdaIntegration(
        "GraphQLApiIntegration",
        lambdaFunction,
        {
          payloadFormatVersion: PayloadFormatVersion.VERSION_1_0,
        }
      ),
      corsPreflight: {
        allowCredentials: false,
        allowOrigins: ["*"],
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ["Content-Type"],
      },
    });

    const certificate = new acm.DnsValidatedCertificate(this, "Certificate", {
      domainName: DOMAIN_NAME,
      hostedZone,
    });

    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "Distribution",
      {
        originConfigs: [
          {
            behaviors: [
              {
                isDefaultBehavior: true,
                defaultTtl: cdk.Duration.minutes(5),
                compress: true,
                allowedMethods: cloudfront.CloudFrontAllowedMethods.ALL,
                forwardedValues: {
                  queryString: true,
                  headers: ["Accept", "Origin"],
                },
                cachedMethods: CloudFrontAllowedCachedMethods.GET_HEAD_OPTIONS,
              },
            ],
            customOriginSource: {
              domainName: `${api.httpApiId}.execute-api.${this.region}.amazonaws.com`,
              httpsPort: 443,
              originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
            },
          },
        ],
        viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(
          certificate,
          {
            aliases: [DOMAIN_NAME],
          }
        ),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      }
    );

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
