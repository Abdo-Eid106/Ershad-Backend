import { NotificationTarget } from '../enums/notification.target';
import { NotificationPayload } from './NotificationPayloud';

export type NotificationJob = {
  target: NotificationTarget;
  tokens: string | string[];
  payload: NotificationPayload;
};
