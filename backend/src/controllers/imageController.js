import fs from 'fs/promises';
import path from 'path';
import { prisma, UPLOAD_DIR } from '../config/db.js';

const view = (i) => ({ ...i, url: `/uploads/${i.filename}` });

export async function list(_req, res) {
  const imgs = await prisma.image.findMany({ include: { _count: { select: { riddles: true } } }, orderBy: { id: 'desc' } });
  res.json(imgs.map(({ _count, ...i }) => ({ ...view(i), riddleCount: _count.riddles })));
}

export async function upload(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Falta el archivo (campo "image")' });
  const label = String(req.body.label || '').trim() || path.parse(req.file.originalname).name;
  const img = await prisma.image.create({ data: { filename: req.file.filename, label } });
  // Enlaza adivinanzas huérfanas cuya respuesta coincide con la etiqueta
  const linked = await prisma.riddle.updateMany({
    where: { answerImageId: null, answerLabel: { equals: label, mode: 'insensitive' } },
    data: { answerImageId: img.id },
  });
  res.status(201).json({ ...view(img), linkedRiddles: linked.count });
}

export async function rename(req, res) {
  const label = String(req.body.label || '').trim();
  if (!label) return res.status(400).json({ error: 'Etiqueta vacía' });
  try { res.json(view(await prisma.image.update({ where: { id: Number(req.params.id) }, data: { label } }))); }
  catch { res.status(404).json({ error: 'No existe' }); }
}

export async function remove(req, res) {
  const id = Number(req.params.id);
  const img = await prisma.image.findUnique({ where: { id } });
  if (!img) return res.status(404).json({ error: 'No existe' });
  // Relación onDelete: SetNull → las adivinanzas quedan sin imagen (no se borran)
  const affected = await prisma.riddle.count({ where: { answerImageId: id } });
  await prisma.image.delete({ where: { id } });
  await fs.unlink(path.join(UPLOAD_DIR, path.basename(img.filename))).catch(() => {});
  res.json({ deleted: id, unlinkedRiddles: affected });
}
