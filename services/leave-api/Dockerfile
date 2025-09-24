# ---------- dev (hot reload) ----------
FROM node:20-alpine AS dev
WORKDIR /workspace/services/leave-api
RUN apk add --no-cache bash
ENV npm_config_loglevel=warn
ENV NODE_ENV=development
EXPOSE 3000

CMD ["sh","-lc","([ -f package-lock.json ] && npm ci || npm i) && (npm exec prisma generate || true) && npm run dev"]

# ---------- runtime (prod) ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 3000
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist ./dist
COPY prisma ./prisma
CMD ["node","dist/main.js"]
