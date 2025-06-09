import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueuesEnum } from './queues.enum';

@Module({
  imports: [
    BullModule.forRoot({ connection: { host: 'localhost', port: 6379 } }),
    BullModule.registerQueue({
      name: QueuesEnum.WARNNINGS,
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
