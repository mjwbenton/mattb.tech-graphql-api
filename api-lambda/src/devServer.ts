process.env.AWS_REGION = "us-east-1";

import express from "express";
import { handler } from "./index";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Context } from "aws-lambda";

const app = express();

app.use(express.json());

app.use(async (request, response) => {
  try {
    const val = (await handler(
      {
        httpMethod: request.method,
        path: request.path,
        headers: request.headers as { [name: string]: string },
        body: JSON.stringify(request.body),
      } as APIGatewayProxyEvent,
      { callbackWaitsForEmptyEventLoop: () => {} } as unknown as Context,
      () => {}
    )) as APIGatewayProxyResult;
    response.status(200).set(val.headers).send(val.body);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.listen(3000);
