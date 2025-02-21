import { Expose, Type } from 'class-transformer';
import { StudentDto } from './student.dto';

export class PaginationMetaDto {
  @Expose()
  total: number;

  @Expose()
  totalPages: number;
}

export class PaginatedStudentsDto {
  @Expose()
  @Type(() => StudentDto)
  data: StudentDto[];

  @Expose()
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto;
}
