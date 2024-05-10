FROM node:13-alpine

COPY nest-cli.json package.json tsconfig.json tsconfig.build.json tslint.json ./

WORKDIR /app

COPY . /app/

RUN npm install

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]