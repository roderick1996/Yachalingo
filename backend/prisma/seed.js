// Carga las 46 adivinanzas del Word (TCLO_RBH_Y_DCQ_2026) con sus imágenes y temáticas.
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const here = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(here, '../src/uploads');
const data = JSON.parse(fs.readFileSync(path.join(here, 'seed-data.json'), 'utf8'));

if ((await prisma.unit.count()) > 0) {
  console.log('Seed: ya hay unidades, se omite');
} else {
  // Limpia los 2 ejemplos de la versión anterior, si existen
  await prisma.riddle.deleteMany({ where: { unitId: null, answerImageId: null, quechua: { startsWith: 'Wasiypa hawanpi' } } });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const unitByOrder = {};
  for (const u of data.units) unitByOrder[u.order] = (await prisma.unit.create({ data: u })).id;

  const imageByKey = {};
  for (const im of data.images) {
    fs.copyFileSync(path.join(here, 'seed-assets', im.file), path.join(UPLOAD_DIR, im.file));
    imageByKey[im.key] = (await prisma.image.upsert({
      where: { filename: im.file }, update: {}, create: { filename: im.file, label: im.label },
    })).id;
  }
  for (const r of data.riddles) {
    await prisma.riddle.create({
      data: {
        quechua: r.quechua, translation: r.translation, hint: r.translation,
        answerLabel: r.label, position: r.position,
        unitId: unitByOrder[r.unit], answerImageId: imageByKey[r.image],
      },
    });
  }
  console.log(`Seed: ${data.units.length} unidades, ${data.images.length} imágenes, ${data.riddles.length} adivinanzas`);
}
await prisma.$disconnect();
