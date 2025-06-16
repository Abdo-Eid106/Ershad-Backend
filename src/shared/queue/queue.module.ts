import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueuesEnum } from './queues.enum';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD'),
          tls: {},
        },
      }),
    }),
    BullModule.registerQueue({
      name: QueuesEnum.WARNINGS,
    }),
    BullModule.registerQueue({
      name: QueuesEnum.NOTIFICATIONS,
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
