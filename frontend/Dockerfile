FROM node:12

WORKDIR /app

COPY package*.json ./
COPY . /app

RUN npm install

RUN npm run build

RUN npm install http-server

EXPOSE 3000

CMD [ "http-server", "build" ]