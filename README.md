# Imasmari App 🐸 (Imasmarikuna en Quechua)

Juego tipo Duolingo para aprender con adivinanzas quechuas. Vue 3 + Quasar + Pinia · Express + Prisma · PostgreSQL.

## Arranque rápido (Docker)
```bash
docker compose up --build
```
- Juego: http://localhost:9000
- Admin: http://localhost:9000/admin  (usuario `admin`, clave `admin123` — cámbialas en `docker-compose.yml`)

## Contenido precargado
Al primer arranque (`SEED=true`) se cargan las **46 adivinanzas** de `TCLO_RBH_Y_DCQ_2026_version_2.docx` con sus imágenes, agrupadas en 8 etapas temáticas:
Ayllu kawsay (vida andina) · Uywakuna (animales) · Pachamama (naturaleza) · Yachaywasi (escuela y juegos) · Awtukuna (vehículos) · Motor & chasis · Cabina & tablero · Seguridad & frenos.
Datos en `backend/prisma/seed-data.json` e imágenes en `backend/prisma/seed-assets/`. Las 5 respuestas que no tenían foto en el Word (tractor, teleférico, mototaxi, moto, rastra) usan un dibujo provisional; reemplázalas en **/admin → Imágenes**.
El progreso del jugador (lecciones, XP, racha) se guarda en el navegador.

## Flujo recomendado
1. Entra a **/admin → Imágenes** y sube las imágenes (la *etiqueta* debe coincidir con la respuesta, ej. `Qhata`).
2. **/admin → Importar Word**: sube tu `.docx`, revisa la vista previa y confirma. Las adivinanzas se enlazan solas con la imagen cuya etiqueta coincide con la respuesta (y también al subir una imagen nueva después).
3. En **Adivinanzas** puedes corregir quechua, traducción, pista, respuesta, crear nuevas o borrar.
4. El juego necesita al menos 2 imágenes (ideal ≥4) y adivinanzas con imagen asignada.

## Formato del Word
Una adivinanza por bloque (separados por línea en blanco, o numerados `1.`, `2.`):
```
1. Quechua text de la adivinanza...
Respuesta: Qhata
Traducción: Texto en español
Pista: (opcional)
```
Etiquetas reconocidas: `Respuesta|Rpta|Kutichiy`, `Traducción|Español|Castellano`, `Pista|Yanapa`.

## Desarrollo local
```bash
cd backend && npm i && cp .env.example .env && npx prisma db push && npm run seed && npm run dev
cd frontend && npm i && npm run dev     # proxy a :3000
```
`.env` backend: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASSWORD`, `UPLOAD_DIR` (opcional).

## MySQL
En `prisma/schema.prisma` cambia `provider = "postgresql"` por `"mysql"` y ajusta `DATABASE_URL`. El esquema es compatible.

## Kubernetes
```bash
docker build -t imasmari-backend:latest backend && docker build -t imasmari-frontend:latest frontend
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/
```
Edita el `Secret` (en `backend-deployment.yaml`), el host de `ingress.yaml` y `storageClassName` si hace falta.

## API
Pública: `GET /api/game/session?count=10`, `POST /api/game/answer`.
Admin (Bearer token de `POST /api/auth/login`): CRUD `/api/riddles`, `/api/images` (upload `multipart` campo `image` + `label`), `POST /api/import/docx` (preview) y `/api/import/docx/commit`.
