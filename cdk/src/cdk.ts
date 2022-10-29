import * as cdk from "aws-cdk-lib";
import { Api } from "./Api";
import { Oauth } from "./Oauth";

const app = new cdk.App();
new Api(app, "Api");
new Oauth(app, "ApiOauth");
