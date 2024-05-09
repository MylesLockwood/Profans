FROM node:13-alpine

COPY package.json tsconfig.json tsconfig.server.json ./

RUN npm install

WORKDIR /app

COPY . /app/

RUN npm run build

CMD ["npm", "start"]