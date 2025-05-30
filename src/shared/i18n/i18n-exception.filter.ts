import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Request, Response } from 'express';
import { ErrorEnum } from './enums/error.enum';

@Catch()
@Injectable()
export class I18nExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message: string = ErrorEnum.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res['message']) {
        message = Array.isArray(res['message'])
          ? res['message'][0]
          : res['message'];
      }
    } else if (exception.message) {
      message = exception.message;
    }

    let translated = message;
    if (typeof message === 'string' && message.includes('.')) {
      translated = await this.i18n.translate(message, {
        lang: (request.headers['accept-language'] as string) || 'en',
        args: exception.args || {},
      });
    }

    response.status(status).json({
      status,
      message: translated,
    });
  }
}
