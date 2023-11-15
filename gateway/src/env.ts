import { cleanEnv, str } from "envalid";

export default cleanEnv(process.env, {
  CACHE_TABLE: str(),
});
