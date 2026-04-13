FROM node:24-alpine
ENV PORT=3000
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev && chown -R node:node node_modules
COPY --chown=node:node . .
USER node
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost:${PORT}/ || exit 1
CMD ["npm", "start"]
