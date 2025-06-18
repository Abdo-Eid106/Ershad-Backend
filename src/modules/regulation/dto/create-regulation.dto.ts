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
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class CreateLevelDto {
  @IsInt({ message: ErrorEnum.REGULATION_LEVEL_VALUE_INT })
  @Min(1, { message: ErrorEnum.REGULATION_LEVEL_VALUE_MIN })
  @Transform(({ value }) => parseInt(value))
  value: number;

  @IsInt({ message: ErrorEnum.REGULATION_LEVEL_REQ_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_LEVEL_REQ_HOURS_MIN })
  @Transform(({ value }) => parseInt(value))
  reqHours: number;
}

export class CreateCourseGpaRange {
  @IsInt({ message: ErrorEnum.REGULATION_COURSE_GPA_FROM_INT })
  @Min(0, { message: ErrorEnum.REGULATION_COURSE_GPA_FROM_MIN })
  @Transform(({ value }) => parseInt(value))
  from: number;

  @IsInt({ message: ErrorEnum.REGULATION_COURSE_GPA_TO_INT })
  @Max(100, { message: ErrorEnum.REGULATION_COURSE_GPA_TO_MAX })
  @Transform(({ value }) => parseInt(value))
  to: number;

  @IsNumber({}, { message: ErrorEnum.REGULATION_COURSE_GPA_GPA_NUMBER })
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  gpa: number;

  @IsString({ message: ErrorEnum.REGULATION_COURSE_GPA_NAME_STRING })
  name: string;
}

export class CreateCumGpaRange {
  @IsNumber({}, { message: ErrorEnum.REGULATION_CUM_GPA_FROM_NUMBER })
  @Min(0, { message: ErrorEnum.REGULATION_CUM_GPA_FROM_MIN })
  @Transform(({ value }) => parseFloat(value))
  from: number;

  @IsNumber({}, { message: ErrorEnum.REGULATION_CUM_GPA_TO_NUMBER })
  @Max(4, { message: ErrorEnum.REGULATION_CUM_GPA_TO_MAX })
  @Transform(({ value }) => parseFloat(value))
  to: number;

  @IsString({ message: ErrorEnum.REGULATION_CUM_GPA_NAME_STRING })
  name: string;
}

export class NameDto {
  @IsString({ message: ErrorEnum.NAME_EN_STRING })
  en: string;

  @IsString({ message: ErrorEnum.NAME_AR_STRING })
  ar: string;
}

export class CreateRegistrationRulesDto {
  @IsInt({ message: ErrorEnum.REGULATION_REG_RULES_MAX_REG_HOURS_INT })
  @Min(1, { message: ErrorEnum.REGULATION_REG_RULES_MAX_REG_HOURS_MIN })
  @Transform(({ value }) => parseInt(value))
  maxRegistrationHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_REG_RULES_NORMAL_REG_HOURS_INT })
  @Min(1, { message: ErrorEnum.REGULATION_REG_RULES_NORMAL_REG_HOURS_MIN })
  @Transform(({ value }) => parseInt(value))
  normalRegistrationHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_REG_RULES_MIN_REG_HOURS_INT })
  @Min(1, { message: ErrorEnum.REGULATION_REG_RULES_MIN_REG_HOURS_MIN })
  @Transform(({ value }) => parseInt(value))
  minRegistrationHours: number;

  @IsNumber(
    {},
    { message: ErrorEnum.REGULATION_REG_RULES_GPA_FOR_MAX_HOURS_NUMBER },
  )
  @Min(0, { message: ErrorEnum.REGULATION_REG_RULES_GPA_FOR_MAX_HOURS_MIN })
  @Max(4, { message: ErrorEnum.REGULATION_REG_RULES_GPA_FOR_MAX_HOURS_MAX })
  @Transform(({ value }) => parseFloat(value))
  gpaForMaxHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_REG_RULES_SUMMER_TERM_HOURS_INT })
  @Min(1, { message: ErrorEnum.REGULATION_REG_RULES_SUMMER_TERM_HOURS_MIN })
  @Transform(({ value }) => parseInt(value))
  summerTermHours: number;
}

export class CreateDismissalRules {
  @IsInt({ message: ErrorEnum.REGULATION_DISMISSAL_MAX_CONSEC_WARNINGS_INT })
  @Min(1, { message: ErrorEnum.REGULATION_DISMISSAL_MAX_CONSEC_WARNINGS_MIN })
  @Transform(({ value }) => parseInt(value))
  maxConsecutiveWarnings: number;

  @IsInt({ message: ErrorEnum.REGULATION_DISMISSAL_MAX_YEARS_LEVEL_ONE_INT })
  @Min(1, { message: ErrorEnum.REGULATION_DISMISSAL_MAX_YEARS_LEVEL_ONE_MIN })
  @Transform(({ value }) => parseInt(value))
  maxYearsLevelOne: number;

  @IsNumber(
    {},
    { message: ErrorEnum.REGULATION_DISMISSAL_MIN_GPA_FOR_GRAD_NUMBER },
  )
  @Min(0, { message: ErrorEnum.REGULATION_DISMISSAL_MIN_GPA_FOR_GRAD_MIN })
  @Max(4, { message: ErrorEnum.REGULATION_DISMISSAL_MIN_GPA_FOR_GRAD_MAX })
  @Transform(({ value }) => parseFloat(value))
  minGpaForGraduation: number;
}

export class CreateRetakeRules {
  @IsInt({ message: ErrorEnum.REGULATION_RETAKE_MAX_RETAKE_GRADE_INT })
  @Min(0, { message: ErrorEnum.REGULATION_RETAKE_MAX_RETAKE_GRADE_MIN })
  @Max(100, { message: ErrorEnum.REGULATION_RETAKE_MAX_RETAKE_GRADE_MAX })
  @Transform(({ value }) => parseInt(value))
  maxRetakeGrade: number;

  @IsInt({ message: ErrorEnum.REGULATION_RETAKE_MAX_RETAKE_COURSES_INT })
  @Min(0, { message: ErrorEnum.REGULATION_RETAKE_MAX_RETAKE_COURSES_MIN })
  @Transform(({ value }) => parseInt(value))
  maxRetakeCourses: number;
}

export class CreateAcademicRequirements {
  @IsInt({ message: ErrorEnum.REGULATION_ACAD_REQ_REG_HOURS_INT })
  @Min(1, { message: ErrorEnum.REGULATION_ACAD_REQ_REG_HOURS_MIN })
  @Transform(({ value }) => parseInt(value))
  regulationHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_ACAD_REQ_LEVELS_COUNT_INT })
  @Min(1, { message: ErrorEnum.REGULATION_ACAD_REQ_LEVELS_COUNT_MIN })
  @Transform(({ value }) => parseInt(value))
  levelsCount: number;

  @IsInt({ message: ErrorEnum.REGULATION_ACAD_REQ_SEMESTERS_WITHOUT_GPA_INT })
  @Min(1, { message: ErrorEnum.REGULATION_ACAD_REQ_SEMESTERS_WITHOUT_GPA_MIN })
  @Transform(({ value }) => parseInt(value))
  semestersWithoutGpaRules: number;
}

export class CreateUniversityRequirements {
  @IsInt({ message: ErrorEnum.REGULATION_UNI_REQ_MANDATORY_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_UNI_REQ_MANDATORY_HOURS_MIN })
  @Transform(({ value }) => parseInt(value))
  mandatoryHours: number;
}

export class CreateBasicScienceRequirements {
  @IsInt({ message: ErrorEnum.REGULATION_BASIC_SCI_MANDATORY_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_BASIC_SCI_MANDATORY_HOURS_MIN })
  @Transform(({ value }) => parseInt(value))
  mandatoryHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_BASIC_SCI_OPTIONAL_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_BASIC_SCI_OPTIONAL_HOURS_MIN })
  @Transform(({ value }) => parseInt(value))
  optionalHours: number;
}

export class CreateFacultyRequirements {
  @IsInt({ message: ErrorEnum.REGULATION_FACULTY_MANDATORY_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_FACULTY_MANDATORY_HOURS_MIN })
  @Transform(({ value }) => parseInt(value))
  mandatoryHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_FACULTY_OPTIONAL_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_FACULTY_OPTIONAL_HOURS_MIN })
  @Transform(({ value }) => parseInt(value))
  optionalHours: number;
}

export class CreateGradProjectRequirements {
  @IsInt({ message: ErrorEnum.REGULATION_GRAD_PROJECT_REQUIRED_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_GRAD_PROJECT_REQUIRED_HOURS_MIN })
  @Transform(({ value }) => parseInt(value))
  requiredHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_GRAD_PROJECT_CREDIT_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_GRAD_PROJECT_CREDIT_HOURS_MIN })
  @Transform(({ value }) => parseInt(value))
  creditHours: number;
}

export class CreateTrainingRequirements {
  @IsInt({ message: ErrorEnum.REGULATION_TRAINING_REQUIRED_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_TRAINING_REQUIRED_HOURS_MIN })
  @Transform(({ value }) => parseInt(value))
  requiredHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_TRAINING_CREDIT_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_TRAINING_CREDIT_HOURS_MIN })
  @Transform(({ value }) => parseInt(value))
  creditHours: number;
}

export class CreateSpecializationRequirements {
  @IsInt({ message: ErrorEnum.REGULATION_SPEC_REQ_REQUIRED_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_SPEC_REQ_REQUIRED_HOURS_MIN })
  @Transform(({ value }) => parseInt(value))
  requiredHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_SPEC_REQ_MANDATORY_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_SPEC_REQ_MANDATORY_HOURS_MIN })
  @Transform(({ value }) => parseInt(value))
  mandatoryHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_SPEC_REQ_OPTIONAL_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_SPEC_REQ_OPTIONAL_HOURS_MIN })
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
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => NameDto)
  name: object;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateRegistrationRulesDto)
  registrationRules: CreateRegistrationRulesDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateAcademicRequirements)
  academicRequirements: CreateAcademicRequirements;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateUniversityRequirements)
  universityRequirements: CreateUniversityRequirements;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateSpecializationRequirements)
  specializationRequirements: CreateSpecializationRequirements;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateFacultyRequirements)
  facultyRequirements: CreateFacultyRequirements;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateBasicScienceRequirements)
  basicScienceRequirements: CreateBasicScienceRequirements;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateRetakeRules)
  retakeRules: CreateRetakeRules;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateDismissalRules)
  dismissalRules: CreateDismissalRules;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateLevelDto)
  levels: CreateLevelDto[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateCourseGpaRange)
  courseGpaRanges: CreateCourseGpaRange[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateCumGpaRange)
  cumGpaRanges: CreateCumGpaRange[];
}
