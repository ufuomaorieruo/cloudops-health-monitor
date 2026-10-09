
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY server.js index.html style.css ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server.js"]
