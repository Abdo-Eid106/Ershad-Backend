import { NotificationTarget } from '../enums/notification.target';
import { NotificationPayload } from './NotificationPayloud';

export type NotificationJob = {
  type: NotificationTarget;
  tokens: string | string[];
  payload: NotificationPayload;
};
