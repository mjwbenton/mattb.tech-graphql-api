import { parse, getIntrospectionQuery } from "graphql";
import { writeFile } from "fs/promises";
import executor from "../billioExecutor";
import mkdirp from "mkdirp";
import path from "path";

const OUT_DIR = path.join(__dirname, "../../src/generated/billio");
const OUT_PATH = path.join(OUT_DIR, "schema.json");

async function main() {
  await mkdirp(OUT_DIR);
  const result = await executor({
    document: parse(getIntrospectionQuery()),
  });
  await writeFile(OUT_PATH, JSON.stringify(result.data));
}
main();
