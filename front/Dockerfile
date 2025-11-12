FROM node:lts-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install -g @angular/cli

RUN npm ci

COPY . .

RUN npm run build --prod

ENV PORT=8080

COPY /app/dist/front/browser/ /usr/share/nginx/html

WORKDIR /app/dist/front/browser/server

EXPOSE 8080

CMD ["node", "./server.mjs"]
