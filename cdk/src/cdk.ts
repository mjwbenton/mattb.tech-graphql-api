import * as cdk from "aws-cdk-lib";
import { BaseApi } from "./BaseApi";
import { Oauth } from "./Oauth";
import { Gateway } from "./Gateway";

const app = new cdk.App();
const oauthStack = new Oauth(app, "ApiOauth");
new BaseApi(app, "Api", {
  oauthTable: oauthStack.table,
  domainName: "api.mattb.tech",
});
new BaseApi(app, "BaseApi", {
  oauthTable: oauthStack.table,
  domainName: "base.api.mattb.tech",
});
new Gateway(app, "Gateway");
