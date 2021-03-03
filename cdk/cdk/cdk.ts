import * as cdk from "@aws-cdk/core";
import { MattbTechGraphQlApi } from "./stack";

const app = new cdk.App();
new MattbTechGraphQlApi(app, "Api");
