import { IsBoolean } from 'class-validator';

export class UpdateRegistrationStatus {
  @IsBoolean()
  isOpen: boolean;
}
