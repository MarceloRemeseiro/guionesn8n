#!/bin/bash
echo "🚀 Iniciando deploy..."

echo "📦 Generando Prisma Client..."
npx prisma generate

echo "🔄 Ejecutando migraciones..."
npx prisma migrate deploy

echo "✅ Deploy completado!"