import * as cdk from "aws-cdk-lib";
import { BaseApi } from "./BaseApi";
import { Oauth } from "./Oauth";
import { Gateway } from "./Gateway";

const app = new cdk.App();
const oauthStack = new Oauth(app, "ApiOauth");
new BaseApi(app, "BaseApi", { oauthTable: oauthStack.table });
new Gateway(app, "Gateway");
