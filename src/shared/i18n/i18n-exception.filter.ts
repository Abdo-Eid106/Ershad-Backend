import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';

type ExceptionResponse = {
  message?: string | string[];
  args?: Record<string, any>;
};

@Catch(HttpException)
@Injectable()
export class I18nExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const message = this.extractErrorMessage(exception);
    const args = this.extractArgs(exception);
    const lang = this.extractLanguage(request);

    let translatedMessage: string;
    try {
      translatedMessage = this.i18n.t(message, { lang, args });
    } catch (error) {
      translatedMessage = message;
    }

    response.status(status).json({
      statusCode: status,
      message: translatedMessage,
    });
  }

  private extractErrorMessage(exception: HttpException): string {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (this.isExceptionResponse(response) && response.message) {
      if (Array.isArray(response.message)) {
        return response.message[0];
      }
      return response.message;
    }

    return exception.message;
  }

  private extractArgs(exception: HttpException): Record<string, any> {
    const response = exception.getResponse();

    if (this.isExceptionResponse(response) && response.args) {
      return response.args;
    }

    return {};
  }

  private extractLanguage(request: Request): string {
    return request.headers['accept-language']?.toString() || 'en';
  }

  private isExceptionResponse(obj: any): obj is ExceptionResponse {
    return typeof obj === 'object' && obj !== null;
  }
}
