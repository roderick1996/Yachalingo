import mammoth from 'mammoth';
import { prisma } from '../config/db.js';

export function parseRiddles(text) {
  text = text.replace(/\r/g, '').trim();
  let blocks = text.split(/\n(?=\s*\d+\s*[.)]\s)/);          // numeradas
  if (blocks.length < 2) blocks = text.split(/\n\s*\n/);      // o separadas por línea en blanco
  return blocks
    .map((b) => b.split('\n').map((l) => l.trim()).filter(Boolean))
    .filter((l) => l.length)
    .map((lines) => {
      const r = { quechua: '', translation: '', hint: '', answerLabel: '' };
      const q = [];
      for (const l of lines) {
        let m;
        if ((m = l.match(/^(respuesta|rpta|kutichiy)\s*[:\-–]\s*(.+)$/i))) r.answerLabel = m[2].trim();
        else if ((m = l.match(/^(traducci[oó]n|espa[ñn]ol|castellano)\s*[:\-–]\s*(.+)$/i))) r.translation = m[2].trim();
        else if ((m = l.match(/^(pista|yanapa)\s*[:\-–]\s*(.+)$/i))) r.hint = m[2].trim();
        else q.push(l.replace(/^\d+\s*[.)\-]\s*/, ''));
      }
      r.quechua = q.join(' ');
      return r;
    })
    .filter((r) => r.quechua && r.answerLabel);
}

// Paso 1: sube el .docx y devuelve vista previa (no guarda)
export async function preview(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Falta el archivo (campo "file")' });
  try {
    const { value } = await mammoth.extractRawText({ buffer: req.file.buffer });
    const items = parseRiddles(value);
    if (!items.length) return res.status(422).json({ error: 'No se detectaron adivinanzas. Revisa el formato en el README.' });
    res.json({ items });
  } catch (e) { res.status(400).json({ error: 'No se pudo leer el .docx: ' + e.message }); }
}

// Paso 2: guarda los items (posiblemente editados en pantalla)
export async function commit(req, res) {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const images = await prisma.image.findMany();
  const byLabel = new Map(images.map((i) => [i.label.toLowerCase(), i.id]));
  const data = items
    .filter((r) => r.quechua?.trim() && r.answerLabel?.trim())
    .map((r) => ({
      quechua: r.quechua.trim(),
      translation: (r.translation || '').trim(),
      hint: (r.hint || '').trim(),
      answerLabel: r.answerLabel.trim(),
      answerImageId: byLabel.get(r.answerLabel.trim().toLowerCase()) ?? null,
    }));
  const out = await prisma.riddle.createMany({ data });
  res.status(201).json({ created: out.count, withoutImage: data.filter((d) => !d.answerImageId).length });
}
