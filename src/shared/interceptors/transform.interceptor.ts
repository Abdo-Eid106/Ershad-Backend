import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T> {
  constructor(private readonly i18nService: I18nService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        if (!data) return;
        if (data.message) data.message = this.i18nService.t(data.message);
        return data;
      }),
    );
  }
}
