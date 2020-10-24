FROM node:12

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

RUN mkdir ./dist

COPY ./dist ./dist

EXPOSE 3333

CMD [ "npm", "start" ]