import { IsBoolean } from 'class-validator';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class UpdateRegistrationStatus {
  @IsBoolean({ message: ErrorEnum.REGISTRATION_STATUS_IS_OPEN_BOOLEAN })
  isOpen: boolean;
}
