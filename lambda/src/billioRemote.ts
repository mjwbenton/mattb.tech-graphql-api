import { wrapSchema } from "@graphql-tools/wrap";
import { buildClientSchema } from "graphql/utilities";
import executor from "./billioExecutor";
import schema from "./generated/billio/schema.json";

const wrappedSchema = wrapSchema({
  schema: buildClientSchema(schema as any),
  executor,
});

export default wrappedSchema;
