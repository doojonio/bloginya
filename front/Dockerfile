FROM node:lts-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install -g @angular/cli

RUN npm install

COPY . .

RUN npm run build --prod
