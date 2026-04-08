FROM node:24-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
CMD ["npm", "start"]
