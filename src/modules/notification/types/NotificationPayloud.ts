import { NotficationType } from '../enums/notification.type';

export type NotificationPayload = {
  notification: {
    title: string;
    body: string;
  };
  data: {
    type: NotficationType;
    id: string;
  };
};
