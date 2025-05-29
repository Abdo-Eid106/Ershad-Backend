import { IsArray, IsUUID } from 'class-validator';
import { UUID } from 'crypto';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class CreateRegistrationDto {
  @IsArray({ message: ErrorEnum.REGISTRATION_COURSE_IDS_ARRAY })
  @IsUUID('all', {
    each: true,
    message: ErrorEnum.REGISTRATION_COURSE_IDS_UUID,
  })
  courseIds: UUID[];
}
