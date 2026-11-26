import fs from 'fs/promises';
import path from 'path';
import { prisma, UPLOAD_DIR } from '../config/db.js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dfvcaqkbnkvvozppauiz.supabase.co';
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'imasmari-media';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';
const MEDIA_BASE_URL =
  process.env.MEDIA_BASE_URL ||
  `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}`;

const view = (i) => ({ ...i, url: `${MEDIA_BASE_URL}/${i.filename}` });

async function uploadToSupabase(localPath, filename, mimeType = 'application/octet-stream') {
  if (!SUPABASE_SECRET_KEY) return;
  const buf = await fs.readFile(localPath);
  await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${encodeURIComponent(filename)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      apikey: SUPABASE_SECRET_KEY,
      'x-upsert': 'true',
      'Content-Type': mimeType,
    },
    body: buf,
  }).catch(() => {});
}

async function deleteFromSupabase(filename) {
  if (!SUPABASE_SECRET_KEY) return;
  await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      apikey: SUPABASE_SECRET_KEY,
    },
  }).catch(() => {});
}

export async function list(_req, res) {
  const imgs = await prisma.image.findMany({
    include: { _count: { select: { riddles: true } } },
    orderBy: { id: 'desc' },
  });
  res.json(imgs.map(({ _count, ...i }) => ({ ...view(i), riddleCount: _count.riddles })));
}

export async function upload(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Falta el archivo (campo "image")' });
  const label = String(req.body.label || '').trim() || path.parse(req.file.originalname).name;
  await uploadToSupabase(req.file.path, req.file.filename, req.file.mimetype);
  const img = await prisma.image.create({ data: { filename: req.file.filename, label } });
  const linked = await prisma.riddle.updateMany({
    where: { answerImageId: null, answerLabel: { equals: label, mode: 'insensitive' } },
    data: { answerImageId: img.id },
  });
  res.status(201).json({ ...view(img), linkedRiddles: linked.count });
}

export async function rename(req, res) {
  const label = String(req.body.label || '').trim();
  if (!label) return res.status(400).json({ error: 'Etiqueta vacía' });
  try {
    res.json(view(await prisma.image.update({ where: { id: Number(req.params.id) }, data: { label } })));
  } catch {
    res.status(404).json({ error: 'No existe' });
  }
}

export async function remove(req, res) {
  const id = Number(req.params.id);
  const img = await prisma.image.findUnique({ where: { id } });
  if (!img) return res.status(404).json({ error: 'No existe' });
  const affected = await prisma.riddle.count({ where: { answerImageId: id } });
  await prisma.image.delete({ where: { id } });
  await deleteFromSupabase(path.basename(img.filename));
  await fs.unlink(path.join(UPLOAD_DIR, path.basename(img.filename))).catch(() => {});
  res.json({ deleted: id, unlinkedRiddles: affected });
}
