import { Expose, Type } from 'class-transformer';
import { Regulation } from '../entities';

class NameDto {
  @Expose()
  en: string;

  @Expose()
  ar: string;
}

class CreateLevelDto {
  @Expose()
  value: number;

  @Expose()
  reqHours: number;
}

class CreateCourseGpaRange {
  @Expose()
  from: number;

  @Expose()
  to: number;

  @Expose()
  gpa: number;

  @Expose()
  name: string;
}

class CreateCumGpaRange {
  @Expose()
  from: number;

  @Expose()
  to: number;

  @Expose()
  name: string;
}

class CreateRegistrationRulesDto {
  @Expose()
  maxRegistrationHours: number;

  @Expose()
  normalRegistrationHours: number;

  @Expose()
  minRegistrationHours: number;

  @Expose()
  gpaForMaxHours: number;

  @Expose()
  summerTermHours: number;
}

class CreateDismissalRules {
  @Expose()
  maxConsecutiveWarnings: number;

  @Expose()
  maxYearsLevelOne: number;

  @Expose()
  minGpaForGraduation: number;
}

class CreateRetakeRules {
  @Expose()
  maxRetakeGrade: number;

  @Expose()
  maxRetakeCourses: number;
}

class CreateAcademicRequirements {
  @Expose()
  regulationHours: number;

  @Expose()
  levelsCount: number;

  @Expose()
  semestersWithoutGpaRules: number;
}

class CreateUniversityRequirements {
  @Expose()
  mandatoryHours: number;
}

class CreateBasicScienceRequirements {
  @Expose()
  mandatoryHours: number;

  @Expose()
  optionalHours: number;
}

class CreateFacultyRequirements {
  @Expose()
  mandatoryHours: number;

  @Expose()
  optionalHours: number;
}

class CreateGradProjectRequirements {
  @Expose()
  requiredHours: number;

  @Expose()
  creditHours: number;
}

class CreateTrainingRequirements {
  @Expose()
  requiredHours: number;

  @Expose()
  creditHours: number;
}

class CreateSpecializationRequirements {
  @Expose()
  requiredHours: number;

  @Expose()
  mandatoryHours: number;

  @Expose()
  optionalHours: number;

  @Expose()
  @Type(() => CreateGradProjectRequirements)
  gradProjectRequirements: CreateGradProjectRequirements;

  @Expose()
  @Type(() => CreateTrainingRequirements)
  trainingRequirements: CreateTrainingRequirements;
}

export class RegulationDto {
  @Expose()
  id: Regulation['id'];

  @Expose()
  @Type(() => NameDto)
  name: NameDto;

  @Expose()
  @Type(() => CreateRegistrationRulesDto)
  registrationRules: CreateRegistrationRulesDto;

  @Expose()
  @Type(() => CreateAcademicRequirements)
  academicRequirements: CreateAcademicRequirements;

  @Expose()
  @Type(() => CreateUniversityRequirements)
  universityRequirements: CreateUniversityRequirements;

  @Expose()
  @Type(() => CreateSpecializationRequirements)
  specializationRequirements: CreateSpecializationRequirements;

  @Expose()
  @Type(() => CreateFacultyRequirements)
  facultyRequirements: CreateFacultyRequirements;

  @Expose()
  @Type(() => CreateBasicScienceRequirements)
  basicScienceRequirements: CreateBasicScienceRequirements;

  @Expose()
  @Type(() => CreateRetakeRules)
  retakeRules: CreateRetakeRules;

  @Expose()
  @Type(() => CreateDismissalRules)
  dismissalRules: CreateDismissalRules;

  @Expose()
  @Type(() => CreateLevelDto)
  levels: CreateLevelDto[];

  @Expose()
  @Type(() => CreateCourseGpaRange)
  courseGpaRanges: CreateCourseGpaRange[];

  @Expose()
  @Type(() => CreateCumGpaRange)
  cumGpaRanges: CreateCumGpaRange[];
}
