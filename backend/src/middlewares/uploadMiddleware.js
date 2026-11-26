import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { UPLOAD_DIR } from '../config/db.js';

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const uploadImage = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) =>
      cb(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    /^image\/(png|jpe?g|webp|gif|svg\+xml)$/.test(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Solo se permiten imágenes')),
}).single('image');

export const uploadDocx = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('file');
