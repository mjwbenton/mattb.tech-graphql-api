import { wrapSchema } from "@graphql-tools/wrap";
import { buildClientSchema } from "graphql/utilities";
import schema from "./generated/billio/schema.json";
import buildExecutor from "./remoteExecutor";

const ENDPOINT = "https://api-readonly.billio.mattb.tech";

const wrappedSchema = wrapSchema({
  schema: buildClientSchema(schema as any),
  executor: buildExecutor(ENDPOINT),
});

export default wrappedSchema;