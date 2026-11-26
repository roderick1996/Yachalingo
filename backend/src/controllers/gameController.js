import { prisma } from '../config/db.js';

const shuffle = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const imgView = (i) => ({ id: i.id, label: i.label, url: `/uploads/${i.filename}` });

// GET /game/session?ids=1,2,3  (una lección)  |  ?count=10 (práctica libre)
export async function session(req, res) {
  const ids = String(req.query.ids || '').split(',').map(Number).filter(Boolean);
  const count = Math.min(Number(req.query.count) || 10, 30);
  const [all, images] = await Promise.all([
    prisma.riddle.findMany({ where: { answerImageId: { not: null } } }),
    prisma.image.findMany(),
  ]);
  const imgById = new Map(images.map((i) => [i.id, i]));
  const pool = ids.length ? all.filter((r) => ids.includes(r.id)) : all;

  const items = shuffle(pool).slice(0, ids.length ? 30 : count).map((r) => {
    // Distractores: primero de la misma temática (más reto), luego del resto
    const same = shuffle([...new Set(all.filter((x) => x.unitId === r.unitId).map((x) => x.answerImageId))].filter((id) => id !== r.answerImageId));
    const others = shuffle(images.map((i) => i.id).filter((id) => id !== r.answerImageId && !same.includes(id)));
    const distractors = [...same, ...others].slice(0, 3).map((id) => imgById.get(id));
    return {
      id: r.id,
      quechua: r.quechua,
      hint: r.hint || r.translation,
      options: shuffle([imgById.get(r.answerImageId), ...distractors]).map(imgView),
    };
  });
  res.json({ items, totalImages: images.length });
}

export async function answer(req, res) {
  const { riddleId, imageId } = req.body || {};
  const r = await prisma.riddle.findUnique({ where: { id: Number(riddleId) }, include: { answerImage: true } });
  if (!r) return res.status(404).json({ error: 'Adivinanza no encontrada' });
  res.json({
    correct: r.answerImageId === Number(imageId),
    correctImage: r.answerImage ? imgView(r.answerImage) : null,
    answerLabel: r.answerLabel,
    translation: r.translation,
    explanation: r.explanation,
  });
}
