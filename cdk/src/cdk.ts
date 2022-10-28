import * as cdk from "@aws-cdk/core";
import { Api } from "./Api";

const app = new cdk.App();
new Api(app, "Api");
