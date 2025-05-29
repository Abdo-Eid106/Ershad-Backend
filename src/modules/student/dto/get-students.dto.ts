import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class GetStudentsDto {
  @IsString({ message: ErrorEnum.SEARCH_STRING })
  @IsOptional()
  search?: string;

  @IsInt({ message: ErrorEnum.PAGE_INT })
  @Type(() => Number)
  page: number;

  @IsInt({ message: ErrorEnum.LIMIT_INT })
  @Type(() => Number)
  limit: number;
}
