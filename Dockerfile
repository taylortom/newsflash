FROM arm32v7/node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "start"]
