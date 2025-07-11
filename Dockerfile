FROM node:24-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 3333

CMD ["npm", "start"]
