FROM node:13-alpine

COPY package.json tsconfig.json tsconfig.server.json ./

WORKDIR /app

COPY . /app/

RUN npm install

RUN npm run build

EXPOSE 8082

CMD ["npm", "start"]