FROM node:20-alpine AS base

WORKDIR /usr/src/app

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install all dependencies (clean production or dev dependencies)
RUN npm ci

# Copy application source code
COPY . .

# Expose backend API and WebSocket port
EXPOSE 8000

CMD ["npm", "run", "dev"]