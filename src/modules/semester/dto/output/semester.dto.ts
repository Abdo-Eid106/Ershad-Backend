import { Expose, Type } from 'class-transformer';
import { CourseDto } from 'src/modules/course/dto/course.dto';

export class SemesterCoursePerformance {
  @Expose()
  degree: number;

  @Expose()
  grade: string;

  @Expose()
  gpa: number;
}

export class SemesterCourseDto {
  @Expose()
  course: Partial<CourseDto>;

  @Expose()
  @Type(() => SemesterCoursePerformance)
  performance: SemesterCoursePerformance;
}

export class SemesterStatistics {
  @Expose()
  attemptedHours: number;

  @Expose()
  gainedHours: number;

  @Expose()
  gpa: number;

  @Expose()
  cumGpa: number;
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
  @Type(() => SemesterStatistics)
  statistics: SemesterStatistics;

  @Expose()
  @Type(() => SemesterCourseDto)
  semesterCourses: SemesterCourseDto[];
}
