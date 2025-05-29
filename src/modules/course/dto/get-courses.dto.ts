import { IsInt, IsOptional, IsString } from 'class-validator';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class GetCoursesDto {
  @IsOptional()
  @IsString({ message: ErrorEnum.SEARCH_STRING })
  search: string = '';

  @IsOptional()
  @IsInt({ message: ErrorEnum.PAGE_INT })
  page: number = 1;

  @IsOptional()
  @IsInt({ message: ErrorEnum.LIMIT_INT })
  limit: number = 10;
}
