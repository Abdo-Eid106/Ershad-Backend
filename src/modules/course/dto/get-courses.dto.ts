import { IsInt, IsOptional, IsString } from 'class-validator';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class GetCoursesDto {
  @IsOptional()
  @IsString({ message: ErrorEnum.GET_COURSES_SEARCH_STRING })
  search: string = '';

  @IsOptional()
  @IsInt({ message: ErrorEnum.GET_COURSES_PAGE_INT })
  page: number = 1;

  @IsOptional()
  @IsInt({ message: ErrorEnum.GET_COURSES_LIMIT_INT })
  limit: number = 10;
}
