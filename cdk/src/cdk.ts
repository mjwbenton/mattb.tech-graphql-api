import * as cdk from "aws-cdk-lib";
import { Api } from "./Api";
import { Oauth } from "./Oauth";

const app = new cdk.App();
const oauthStack = new Oauth(app, "ApiOauth");
new Api(app, "Api", { oauthTable: oauthStack.table });
