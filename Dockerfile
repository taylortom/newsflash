FROM node:24-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3000}/health || exit 1
CMD ["npm", "start"]
