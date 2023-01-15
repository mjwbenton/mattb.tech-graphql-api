import { wrapSchema } from "@graphql-tools/wrap";
import { buildClientSchema } from "graphql/utilities";
import schema from "./generated/healthio/schema.json";
import buildExecutor from "./remoteExecutor";

const ENDPOINT = "https://graphql.healthio.mattb.tech";

const wrappedSchema = wrapSchema({
  schema: buildClientSchema(schema as any),
  executor: buildExecutor(ENDPOINT),
});

export default wrappedSchema;
