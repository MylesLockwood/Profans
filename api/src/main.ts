/* eslint-disable import/newline-after-import */
/* eslint-disable import/first */
// global config for temmplates dir
require('dotenv').config();
process.env.TEMPLATE_DIR = `${__dirname}/templates`;

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { renderFile } from './kernel/helpers/view.helper';
import { HttpExceptionLogFilter } from './kernel/logger/http-exception-log.filter';
import { RedisIoAdapter } from './modules/socket/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const httpAdapter = app.getHttpAdapter();
  // TODO - config for domain
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionLogFilter(httpAdapter));
  app.engine('html', renderFile);
  app.set('view engine', 'html');
  // socket io redis - for chat
  app.useWebSocketAdapter(new RedisIoAdapter(app));

  if (process.env.NODE_ENV === 'development') {
    // generate api docs
    const options = new DocumentBuilder()
      .setTitle('API docs')
      .setDescription('The API docs')
      .setVersion('1.0')
      .addTag('api')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('apidocs', app, document);
  }

  await app.listen(process.env.HTTP_PORT);
}
bootstrap();
