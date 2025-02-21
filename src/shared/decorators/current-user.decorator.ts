import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const currentUser = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    return context.switchToHttp().getRequest().user;
  },
);
