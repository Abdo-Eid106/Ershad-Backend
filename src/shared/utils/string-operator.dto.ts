import { IsString, IsOptional } from 'class-validator';

export class StringOperator {
  @IsOptional()
  @IsString()
  contains?: string;

  @IsOptional()
  @IsString()
  startsWith?: string;

  @IsOptional()
  @IsString()
  endsWith?: string;

  @IsOptional()
  @IsString()
  equals?: string;
}
