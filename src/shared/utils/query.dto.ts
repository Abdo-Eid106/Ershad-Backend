import { Transform } from 'class-transformer';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class QueryDto {
  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  fields?: string;

  @IsOptional()
  @IsNumberString()
  page?: number;

  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => Number(value))
  limit?: number;
}
