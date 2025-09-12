FROM node:20-alpine

# Instalar dependencias del sistema para Prisma
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci

# Generar Prisma Client
RUN npx prisma generate

# Copiar el resto del código
COPY . .

# Build de la aplicación
RUN npm run build

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Cambiar ownership de archivos
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3030

ENV PORT 3030
ENV HOSTNAME "0.0.0.0"

# Script de inicio que ejecuta migraciones
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]