import { Expose, Type } from 'class-transformer';

class NameDto {
  @Expose()
  en: string;

  @Expose()
  ar: string;
}

class ProgramSummaryDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => NameDto)
  name: NameDto;

  @Expose()
  degree: string;

  @Expose()
  enrollments: number;
}

export class CourseSummaryDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => NameDto)
  name: NameDto;

  @Expose()
  code: string;

  @Expose()
  enrollments: number;

  @Expose()
  createdAt: number;
}

export class AdminDashboardSummaryDto {
  @Expose()
  totalRegulations: number;

  @Expose()
  totalPrograms: number;

  @Expose()
  totalCourses: number;

  @Expose()
  totalOfficers: number;

  @Expose()
  @Type(() => ProgramSummaryDto)
  mostEnrolledProgram: ProgramSummaryDto;

  @Expose()
  @Type(() => ProgramSummaryDto)
  leastEnrolledProgram: ProgramSummaryDto;

  @Expose()
  @Type(() => CourseSummaryDto)
  newlyAddedCourses: CourseSummaryDto[];

  @Expose()
  @Type(() => CourseSummaryDto)
  mostEnrolledCourses: CourseSummaryDto[];
}
