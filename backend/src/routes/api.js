import { Router } from 'express';
import { login, requireAdmin } from '../middlewares/authMiddleware.js';
import { uploadImage, uploadDocx } from '../middlewares/uploadMiddleware.js';
import * as game from '../controllers/gameController.js';
import * as riddles from '../controllers/riddleController.js';
import * as images from '../controllers/imageController.js';
import * as learn from '../controllers/learnController.js';
import * as docx from '../controllers/docxImportController.js';

const r = Router();
r.get('/health', (_q, s) => s.json({ ok: true }));
r.post('/auth/login', login);

// Juego (público)
r.get('/game/session', game.session);
r.post('/game/answer', game.answer);

r.get('/learn/units', learn.units);

// Administración
r.use(requireAdmin);
r.get('/riddles', riddles.list);
r.post('/riddles', riddles.create);
r.put('/riddles/:id', riddles.update);
r.delete('/riddles/:id', riddles.remove);

r.get('/images', images.list);
r.post('/images', uploadImage, images.upload);
r.patch('/images/:id', images.rename);
r.delete('/images/:id', images.remove);

r.post('/import/docx', uploadDocx, docx.preview);
r.post('/import/docx/commit', docx.commit);

export default r;
