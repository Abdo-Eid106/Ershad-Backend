import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { QueuesEnum } from 'src/shared/queue/queues.enum';
import { FirebaseService } from 'src/shared/firebase/firebase.service';
import { Job } from 'bullmq';
import { NotificationEnum } from './enums/notification.enum';
import { NotificationPayload } from './interfaces/NotificationPayloud';
import { NotificationJob } from './interfaces/NotificationJob';
import { Logger } from '@nestjs/common';

@Processor(QueuesEnum.NOTIFICATIONS)
export class NotificatioConsumer extends WorkerHost {
  private readonly logger = new Logger(NotificatioConsumer.name);

  constructor(private readonly firebaseService: FirebaseService) {
    super();
  }

  async process(job: Job<NotificationJob>): Promise<any> {
    const { type, tokens, payload } = job.data;
    return this.dispatchNotification(type, tokens, payload);
  }

  private async sendToSingleToken(
    token: string,
    payload: NotificationPayload,
  ): Promise<void> {
    await this.firebaseService.messaging().send({
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    });
  }

  private async sendToMultipleTokens(
    tokens: string[],
    payload: NotificationPayload,
  ): Promise<void> {
    await this.firebaseService.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    });
  }

  private async dispatchNotification(
    type: NotificationEnum,
    tokens: string | string[],
    payload: NotificationPayload,
  ): Promise<void> {
    if (type === NotificationEnum.SINGLE) {
      return this.sendToSingleToken(tokens as string, payload);
    }
    return this.sendToMultipleTokens(tokens as string[], payload);
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
