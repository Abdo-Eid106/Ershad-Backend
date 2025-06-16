import { IsString } from 'class-validator';

export class CreateFcmToken {
  @IsString()
  token: string;
}
