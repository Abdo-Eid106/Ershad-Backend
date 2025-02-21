import { Expose, Type } from 'class-transformer';

class NameDto {
  @Expose()
  ar: string;

  @Expose()
  en: string;
}

class StudentDto {
  @Expose()
  @Type(() => NameDto)
  name: NameDto;

  @Expose()
  nationalId: string;

  @Expose()
  universityId: string;
}

class CourseDto {
  @Expose()
  degree: number;

  @Expose()
  courseId: string;
}

export class SemesterDto {
  @Expose()
  id: string;

  @Expose()
  startYear: number;

  @Expose()
  endYear: number;

  @Expose()
  semester: number;

  @Expose()
  @Type(() => StudentDto)
  student: StudentDto;

  @Expose()
  @Type(() => CourseDto)
  semesterCourses: CourseDto[];
}
