process.env.AWS_PROFILE = "mattb.tech-deploy";
process.env.AWS_REGION = "us-east-1";

import express from "express";
import { handler } from "./index";
import { APIGatewayProxyEvent, APIGatewayProxyCallback } from "aws-lambda";
import { Context } from "aws-lambda";

const app = express();

app.use(express.json());

app.use((request, response) => {
  const callback: APIGatewayProxyCallback = (error, val) => {
    if (error) {
      response.status(500).send(error);
      return;
    }
    response.status(200).set(val.headers).send(val.body);
  };
  handler(
    {
      httpMethod: request.method,
      path: request.path,
      headers: request.headers as { [name: string]: string },
      body: JSON.stringify(request.body),
    } as APIGatewayProxyEvent,
    ({ callbackWaitsForEmptyEventLoop: () => {} } as unknown) as Context,
    callback
  );
});

app.listen(3000);
