import fastify from "fastify";
import awsLambdaFastify from "@fastify/aws-lambda";

const app = fastify();
app.get("/", (_, reply) => reply.send({ hello: "world" }));

export const handler = awsLambdaFastify(app);
