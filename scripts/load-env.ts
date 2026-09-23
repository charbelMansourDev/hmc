// tsx does not read .env.local the way Next does; load it explicitly.
// Imported first by seed.ts so env is populated before anything else runs.
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ quiet: true });
