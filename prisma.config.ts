import dotenv from 'dotenv';
dotenv.config();  

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  schema: path.resolve(__dirname, 'prisma/schema.prisma'),
};
