import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class UpdateRegistrationSettings {
  @IsOptional()
  @IsBoolean({ message: ErrorEnum.REGISTRATION_STATUS_IS_OPEN_BOOLEAN })
  isOpen?: boolean;

  @IsOptional()
  @IsInt({ message: ErrorEnum.SEMESTER_SEMESTER_INT })
  @Min(1, { message: ErrorEnum.SEMESTER_SEMESTER_MIN })
  @Max(3, { message: ErrorEnum.SEMESTER_SEMESTER_MAX })
  semester?: number;
}
