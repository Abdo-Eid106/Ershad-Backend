import { Module } from '@nestjs/common';
import { NotificatioConsumer } from './notification.consumer';
import { QueueModule } from 'src/shared/queue/queue.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FcmToken } from '../fcm-token/entities/fcm-token.entity';
import { FirebaseModule } from 'src/shared/firebase/firebase.module';

@Module({
  imports: [QueueModule, TypeOrmModule.forFeature([FcmToken]), FirebaseModule],
  providers: [NotificatioConsumer],
})
export class NotificationModule {}
