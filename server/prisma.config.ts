import { defineConfig } from "@prisma/config";
import * as dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, "prisma");

export default defineConfig({
  schema: schemaPath,
});
