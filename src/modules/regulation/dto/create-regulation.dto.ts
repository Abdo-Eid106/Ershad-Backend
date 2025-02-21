import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  IsNumber,
  IsArray,
  Min,
  ValidateNested,
  Max,
  IsNotEmpty,
} from 'class-validator';

export class CreateLevelDto {
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  value: number;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  reqHours: number;
}

export class CreateCourseGpaRange {
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  from: number;

  @IsInt()
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  to: number;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  gpa: number;

  @IsString()
  name: string;
}

export class CreateCumGpaRange {
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  from: number;

  @IsNumber()
  @Max(4)
  @Transform(({ value }) => Number(value))
  to: number;

  @IsString()
  name: string;
}

export class NameDto {
  @IsNotEmpty({ message: 'English name is required' })
  @IsString()
  en: string;

  @IsNotEmpty({ message: 'Arabic name is required' })
  @IsString()
  ar: string;
}

export class CreateRegistrationRulesDto {
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  maxRegistrationHours: number;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  normalRegistrationHours: number;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  minRegistrationHours: number;

  @IsNumber()
  @Min(0)
  @Max(4)
  @Transform(({ value }) => parseFloat(value))
  gpaForMaxHours: number;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  summerTermHours: number;
}

export class CreateDismissalRules {
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  maxConsecutiveWarnings: number;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  maxYearsLevelOne: number;

  @IsNumber()
  @Min(0)
  @Max(4)
  @Transform(({ value }) => parseFloat(value))
  minGpaForGraduation: number;
}

export class CreateRetakeRules {
  @IsInt()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  maxRetakeGrade: number;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  maxRetakeCourses: number;
}

export class CreateAcademicRequirements {
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  regulationHours: number;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  levelsCount: number;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  semestersWithoutGpaRules: number;
}

export class CreateUniversityRequirements {
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  mandatoryHours: number;
}

export class CreateBasicScienceRequirements {
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  mandatoryHours: number;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  optionalHours: number;
}

export class CreateFacultyRequirements {
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  mandatoryHours: number;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  optionalHours: number;
}

export class CreateGradProjectRequirements {
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  requiredHours: number;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  creditHours: number;
}

export class CreateTrainingRequirements {
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  requiredHours: number;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  creditHours: number;
}

export class CreateSpecializationRequirements {
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  requiredHours: number;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  mandatoryHours: number;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  optionalHours: number;

  @ValidateNested()
  @Type(() => CreateGradProjectRequirements)
  gradProjectRequirements: CreateGradProjectRequirements;

  @ValidateNested()
  @Type(() => CreateTrainingRequirements)
  trainingRequirements: CreateTrainingRequirements;
}

export class CreateRegulationDto {
  @ValidateNested()
  @Type(() => NameDto)
  name: object;

  @ValidateNested()
  @Type(() => CreateRegistrationRulesDto)
  registrationRules: CreateRegistrationRulesDto;

  @ValidateNested()
  @Type(() => CreateAcademicRequirements)
  academicRequirements: CreateAcademicRequirements;

  @ValidateNested()
  @Type(() => CreateUniversityRequirements)
  universityRequirements: CreateUniversityRequirements;

  @ValidateNested()
  @Type(() => CreateSpecializationRequirements)
  specializationRequirements: CreateSpecializationRequirements;

  @ValidateNested()
  @Type(() => CreateFacultyRequirements)
  facultyRequirements: CreateFacultyRequirements;

  @ValidateNested()
  @Type(() => CreateBasicScienceRequirements)
  basicScienceRequirements: CreateBasicScienceRequirements;

  @ValidateNested()
  @Type(() => CreateRetakeRules)
  retakeRules: CreateRetakeRules;

  @ValidateNested()
  @Type(() => CreateDismissalRules)
  dismissalRules: CreateDismissalRules;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLevelDto)
  levels: CreateLevelDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCourseGpaRange)
  courseGpaRanges: CreateCourseGpaRange[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCumGpaRange)
  cumGpaRanges: CreateCumGpaRange[];
}
