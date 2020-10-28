FROM node:12.16.1-alpine3.9
WORKDIR /app
COPY ./package.json /app/
COPY . /app
RUN npm install
RUN npm run build
CMD [ "npm", "start" ]