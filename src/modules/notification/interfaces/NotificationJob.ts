import { NotificationEnum } from '../enums/notification.enum';
import { NotificationPayload } from './NotificationPayloud';

export interface NotificationJob {
  type: NotificationEnum;
  tokens: string | string[];
  payload: NotificationPayload;
}
