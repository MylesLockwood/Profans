FROM node:13-alpine

COPY nest-cli.json package.json tsconfig.json tsconfig.build.json tslint.json ./

WORKDIR /app

COPY . /app/

USER node

CMD ["npm", "start"]