import { prisma } from '../config/db.js';

const clean = (b) => ({
  quechua: String(b.quechua || '').trim(),
  translation: String(b.translation || '').trim(),
  hint: String(b.hint || '').trim(),
  explanation: String(b.explanation || '').trim(),
  answerLabel: String(b.answerLabel || '').trim(),
  answerImageId: b.answerImageId ? Number(b.answerImageId) : null,
  unitId: b.unitId ? Number(b.unitId) : null,
});

export const list = async (_req, res) =>
  res.json(await prisma.riddle.findMany({ include: { answerImage: true }, orderBy: { id: 'asc' } }));

export async function create(req, res) {
  const data = clean(req.body);
  if (!data.quechua || !data.answerLabel) return res.status(400).json({ error: 'Quechua y respuesta son obligatorios' });
  if (!data.answerImageId) {
    const img = await prisma.image.findFirst({ where: { label: { equals: data.answerLabel, mode: 'insensitive' } } });
    if (img) data.answerImageId = img.id;
  }
  res.status(201).json(await prisma.riddle.create({ data }));
}

export async function update(req, res) {
  const data = clean(req.body);
  if (!data.quechua || !data.answerLabel) return res.status(400).json({ error: 'Quechua y respuesta son obligatorios' });
  try {
    res.json(await prisma.riddle.update({ where: { id: Number(req.params.id) }, data }));
  } catch { res.status(404).json({ error: 'No existe' }); }
}

export async function remove(req, res) {
  try {
    await prisma.riddle.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch { res.status(404).json({ error: 'No existe' }); }
}
