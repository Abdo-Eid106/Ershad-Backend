import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DelayMiddleWare } from './shared/middlewares/delay.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api/');
  // app.use(new DelayMiddleWare().use);
  await app.listen(3000);
}
bootstrap();
