import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import path from "path";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as apigateway from "@aws-cdk/aws-apigatewayv2";
import * as iam from "@aws-cdk/aws-iam";
import * as route53 from "@aws-cdk/aws-route53";
import * as route53targets from "@aws-cdk/aws-route53-targets";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as acm from "@aws-cdk/aws-certificatemanager";

const HOSTED_ZONE = "mattb.tech";
const HOSTED_ZONE_ID = "Z2GPSB1CDK86DH";
const DOMAIN_NAME = "api.mattb.tech";

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

    const certificate = new acm.Certificate(this, "Certificate", {
      domainName: DOMAIN_NAME,
      validationMethod: acm.ValidationMethod.DNS
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
                  headers: ["Accept", "accept"]
                }
              }
            ],
            customOriginSource: {
              domainName: `${api.ref}.execute-api.${this.region}.amazonaws.com`,
              httpsPort: 443,
              originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY
            }
          }
        ],
        viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(
          certificate,
          {
            aliases: [DOMAIN_NAME]
          }
        ),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      }
    );

    new route53.ARecord(this, "DomainRecord", {
      zone: route53.HostedZone.fromHostedZoneAttributes(this, "Zone", {
        hostedZoneId: HOSTED_ZONE_ID,
        zoneName: HOSTED_ZONE
      }),
      recordName: DOMAIN_NAME,
      ttl: cdk.Duration.minutes(5),
      target: route53.RecordTarget.fromAlias(
        new route53targets.CloudFrontTarget(distribution)
      )
    });
  }
}