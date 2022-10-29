import * as cdk from "aws-cdk-lib";
import { Api } from "./Api";

const app = new cdk.App();
new Api(app, "Api");
