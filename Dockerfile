# ── Stage 1 : Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances en premier (cache Docker)
COPY package.json package-lock.json ./
RUN npm ci

# Copier le reste du code source
COPY . .

# Build de production Nuxt
RUN npm run build

# ── Stage 2 : Production ─────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copier uniquement le build Nuxt (Nitro server autonome)
COPY --from=builder /app/.output .output

# Port par défaut de Nitro
ENV HOST=0.0.0.0
ENV PORT=3000
# Autoriser les certificats auto-signés (nécessaire pour INTEG .local)
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

EXPOSE 3000

# Lancer le serveur Nitro
CMD ["node", ".output/server/index.mjs"]
