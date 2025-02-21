import {
  ValidationPipe,
  ValidationError,
  BadRequestException,
} from '@nestjs/common';

export const validationPipe = new ValidationPipe({
  stopAtFirstError: true,
  whitelist: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  exceptionFactory: (errors: ValidationError[]) => {
    const getFirstErrorMessage = (
      validationErrors: ValidationError[],
    ): string | undefined => {
      for (const error of validationErrors) {
        if (error.constraints) return Object.values(error.constraints)[0];
        if (error.children?.length) {
          const nestedError = getFirstErrorMessage(error.children);
          if (nestedError) return nestedError;
        }
      }
      return undefined;
    };

    const firstErrorMessage = getFirstErrorMessage(errors);
    return new BadRequestException(firstErrorMessage || 'Validation error');
  },
});
