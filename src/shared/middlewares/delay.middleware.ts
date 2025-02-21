import { NestMiddleware } from '@nestjs/common';

export class DelayMiddleWare implements NestMiddleware {
  use(req: any, res: any, next: (error?: Error | any) => void) {
    setTimeout(() => {
      next();
    }, 500);
  }
}
