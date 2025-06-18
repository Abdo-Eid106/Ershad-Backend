import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { QueuesEnum } from 'src/shared/queue/queues.enum';
import { FirebaseService } from 'src/shared/firebase/firebase.service';
import { Job } from 'bullmq';
import { NotificationTarget } from './enums/notification.target';
import { NotificationPayload } from './types/NotificationPayloud';
import { NotificationJob } from './types/NotificationJob';
import { Logger } from '@nestjs/common';

@Processor(QueuesEnum.NOTIFICATIONS)
export class NotificatioConsumer extends WorkerHost {
  private readonly logger = new Logger(NotificatioConsumer.name);

  constructor(private readonly firebaseService: FirebaseService) {
    super();
  }

  async process(job: Job<NotificationJob>): Promise<any> {
    const { target, tokens, payload } = job.data;
    if (target === NotificationTarget.SINGLE) {
      return this.sendToSingleToken(tokens as string, payload);
    }
    return this.sendToMultipleTokens(tokens as string[], payload);
  }

  private async sendToSingleToken(
    token: string,
    payload: NotificationPayload,
  ): Promise<void> {
    await this.firebaseService.messaging().send({
      token,
      ...payload,
    });
  }

  private async sendToMultipleTokens(
    tokens: string[],
    payload: NotificationPayload,
  ): Promise<void> {
    await this.firebaseService.messaging().sendEachForMulticast({
      tokens,
      ...payload,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Notification job completed [${job.id}]`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Notification job failed [${job.id}]: ${err.message}`);
  }
}
