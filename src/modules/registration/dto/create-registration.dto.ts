import { IsArray, IsUUID } from 'class-validator';
import { Course } from 'src/modules/course/entites/course.entity';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class CreateRegistrationDto {
  @IsArray({ message: ErrorEnum.COURSE_IDS_ARRAY })
  @IsUUID('all', {
    each: true,
    message: ErrorEnum.COURSE_IDS_UUID,
  })
  courseIds: Course['id'][];
}
