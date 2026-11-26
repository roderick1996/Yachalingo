import express from 'express';
import cors from 'cors';
import api from './routes/api.js';
import { UPLOAD_DIR } from './config/db.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));
app.use('/api', api);

// Manejo de errores (multer, etc.)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 400).json({ error: err.message || 'Error' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Imasmari backend en :${port}`));
