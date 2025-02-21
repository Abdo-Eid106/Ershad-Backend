import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class GetStudentsDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsInt()
  @Type(() => Number)
  page: number;

  @IsInt()
  @Type(() => Number)
  limit: number;
}
