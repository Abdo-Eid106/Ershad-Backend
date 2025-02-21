import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as morgan from 'morgan';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private morganLogger = morgan('dev');

  use(req: Request, res: Response, next: NextFunction): void {
    this.morganLogger(req, res, next);
  }
}
