FROM node:lts-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install -g @angular/cli

RUN npm ci

COPY . .

RUN npm run build --prod

FROM nginx:1.27

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/front/browser/ /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
