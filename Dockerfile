# syntax=docker/dockerfile:1

FROM node:22-alpine

WORKDIR /app

# Install deps first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy Prisma schema + generate client
COPY prisma ./prisma
RUN npm run prisma:generate

# Copy app source (Express backend + static frontend)
COPY src ./src
COPY .env.example ./

ENV NODE_ENV=production
EXPOSE 8080

CMD ["sh", "-c", "npm run prisma:deploy && node src/server.js"]
