import { parse, getIntrospectionQuery, ExecutionResult } from "graphql";
import { writeFile } from "fs/promises";
import buildExecutor from "../remoteExecutor";
import mkdirp from "mkdirp";
import path from "path";

const [endpoint, outputPath] = process.argv.slice(2);

const outputDir = path.dirname(outputPath);

async function main() {
  await mkdirp(outputDir);
  const executor = buildExecutor(endpoint);
  const result = await executor({
    document: parse(getIntrospectionQuery()),
  });
  await writeFile(outputPath, JSON.stringify((result as ExecutionResult).data));
}
main();
