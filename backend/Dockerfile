FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npx prisma generate
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push --skip-generate && ([ \"$SEED\" = \"true\" ] && node prisma/seed.js || true) && node src/index.js"]
