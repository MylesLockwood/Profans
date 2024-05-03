import {
  Catch, ArgumentsHost, HttpException
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { HttpExceptionLogModel } from './http-exception-log.model';

@Catch()
export class HttpExceptionLogFilter extends BaseExceptionFilter {
  async catch(exception: any, host: ArgumentsHost) {
    try {
      if (exception instanceof HttpException && exception.getStatus() !== 500) {
        return super.catch(exception, host);
      }

      const ctx = host.switchToHttp();
      const response = ctx.getResponse<any>();
      const request = ctx.getRequest<any>();
      const status = exception instanceof HttpException ? exception.getStatus() : 500;
      const message = exception instanceof HttpException ? exception.getResponse() : 500;

      const log = new HttpExceptionLogModel({
        path: request.path,
        headers: request.headers,
        query: request.query,
        body: request.body,
        error: exception.stack || exception
      });
      await log.save();

      return response
        .status(status)
        .json({
          statusCode: status,
          message
        });
    } catch (e) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<any>();
      return response
        .status(500)
        .json({
          statusCode: 500,
          message: 'Something went wrong, please try again later!'
        });
    }
  }
}
