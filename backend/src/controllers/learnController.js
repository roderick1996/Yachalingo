import { prisma } from '../config/db.js';

// Ruta de aprendizaje: unidades con los ids de sus adivinanzas jugables (las que tienen imagen)
export async function units(_req, res) {
  const us = await prisma.unit.findMany({
    orderBy: { order: 'asc' },
    include: { riddles: { where: { answerImageId: { not: null } }, orderBy: { position: 'asc' }, select: { id: true } } },
  });
  res.json(us.map(({ riddles, ...u }) => ({ ...u, riddleIds: riddles.map((r) => r.id) })).filter((u) => u.riddleIds.length));
}
