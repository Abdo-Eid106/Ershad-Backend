import { IsInt, IsOptional, IsString } from 'class-validator';

export class GetCoursesDto {
  @IsOptional()
  @IsString()
  search: string = '';

  @IsOptional()
  @IsInt()
  page: number = 1;

  @IsOptional()
  @IsInt()
  limit: number = 10;
}
