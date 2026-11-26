import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

export const prisma = new PrismaClient();
const here = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(here, '../uploads');
