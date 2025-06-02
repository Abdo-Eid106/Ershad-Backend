import { Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  IsNumber,
  IsArray,
  Min,
  ValidateNested,
  Max,
} from 'class-validator';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class CreateLevelDto {
  @IsInt({ message: ErrorEnum.REGULATION_LEVEL_VALUE_INT })
  @Min(1, { message: ErrorEnum.REGULATION_LEVEL_VALUE_MIN })
  value: number;

  @IsInt({ message: ErrorEnum.REGULATION_LEVEL_REQ_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_LEVEL_REQ_HOURS_MIN })
  reqHours: number;
}

export class CreateCourseGpaRange {
  @IsInt({ message: ErrorEnum.REGULATION_COURSE_GPA_FROM_INT })
  @Min(0, { message: ErrorEnum.REGULATION_COURSE_GPA_FROM_MIN })
  from: number;

  @IsInt({ message: ErrorEnum.REGULATION_COURSE_GPA_TO_INT })
  @Max(100, { message: ErrorEnum.REGULATION_COURSE_GPA_TO_MAX })
  to: number;

  @IsNumber({}, { message: ErrorEnum.REGULATION_COURSE_GPA_GPA_NUMBER })
  @Min(0, { message: ErrorEnum.REGULATION_COURSE_GPA_GPA_MIN })
  gpa: number;

  @IsString({ message: ErrorEnum.REGULATION_COURSE_GPA_NAME_STRING })
  name: string;
}

export class CreateCumGpaRange {
  @IsNumber({}, { message: ErrorEnum.REGULATION_CUM_GPA_FROM_NUMBER })
  @Min(0, { message: ErrorEnum.REGULATION_CUM_GPA_FROM_MIN })
  from: number;

  @IsNumber({}, { message: ErrorEnum.REGULATION_CUM_GPA_TO_NUMBER })
  @Max(4, { message: ErrorEnum.REGULATION_CUM_GPA_TO_MAX })
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
  maxRegistrationHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_REG_RULES_NORMAL_REG_HOURS_INT })
  @Min(1, { message: ErrorEnum.REGULATION_REG_RULES_NORMAL_REG_HOURS_MIN })
  normalRegistrationHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_REG_RULES_MIN_REG_HOURS_INT })
  @Min(1, { message: ErrorEnum.REGULATION_REG_RULES_MIN_REG_HOURS_MIN })
  minRegistrationHours: number;

  @IsNumber(
    {},
    { message: ErrorEnum.REGULATION_REG_RULES_GPA_FOR_MAX_HOURS_NUMBER },
  )
  @Min(0, { message: ErrorEnum.REGULATION_REG_RULES_GPA_FOR_MAX_HOURS_MIN })
  @Max(4, { message: ErrorEnum.REGULATION_REG_RULES_GPA_FOR_MAX_HOURS_MAX })
  gpaForMaxHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_REG_RULES_SUMMER_TERM_HOURS_INT })
  @Min(1, { message: ErrorEnum.REGULATION_REG_RULES_SUMMER_TERM_HOURS_MIN })
  summerTermHours: number;
}

export class CreateDismissalRules {
  @IsInt({ message: ErrorEnum.REGULATION_DISMISSAL_MAX_CONSEC_WARNINGS_INT })
  @Min(1, { message: ErrorEnum.REGULATION_DISMISSAL_MAX_CONSEC_WARNINGS_MIN })
  maxConsecutiveWarnings: number;

  @IsInt({ message: ErrorEnum.REGULATION_DISMISSAL_MAX_YEARS_LEVEL_ONE_INT })
  @Min(1, { message: ErrorEnum.REGULATION_DISMISSAL_MAX_YEARS_LEVEL_ONE_MIN })
  maxYearsLevelOne: number;

  @IsNumber(
    {},
    { message: ErrorEnum.REGULATION_DISMISSAL_MIN_GPA_FOR_GRAD_NUMBER },
  )
  @Min(0, { message: ErrorEnum.REGULATION_DISMISSAL_MIN_GPA_FOR_GRAD_MIN })
  @Max(4, { message: ErrorEnum.REGULATION_DISMISSAL_MIN_GPA_FOR_GRAD_MAX })
  minGpaForGraduation: number;
}

export class CreateRetakeRules {
  @IsInt({ message: ErrorEnum.REGULATION_RETAKE_MAX_RETAKE_GRADE_INT })
  @Min(0, { message: ErrorEnum.REGULATION_RETAKE_MAX_RETAKE_GRADE_MIN })
  @Max(100, { message: ErrorEnum.REGULATION_RETAKE_MAX_RETAKE_GRADE_MAX })
  maxRetakeGrade: number;

  @IsInt({ message: ErrorEnum.REGULATION_RETAKE_MAX_RETAKE_COURSES_INT })
  @Min(0, { message: ErrorEnum.REGULATION_RETAKE_MAX_RETAKE_COURSES_MIN })
  maxRetakeCourses: number;
}

export class CreateAcademicRequirements {
  @IsInt({ message: ErrorEnum.REGULATION_ACAD_REQ_REG_HOURS_INT })
  @Min(1, { message: ErrorEnum.REGULATION_ACAD_REQ_REG_HOURS_MIN })
  regulationHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_ACAD_REQ_LEVELS_COUNT_INT })
  @Min(1, { message: ErrorEnum.REGULATION_ACAD_REQ_LEVELS_COUNT_MIN })
  levelsCount: number;

  @IsInt({ message: ErrorEnum.REGULATION_ACAD_REQ_SEMESTERS_WITHOUT_GPA_INT })
  @Min(1, { message: ErrorEnum.REGULATION_ACAD_REQ_SEMESTERS_WITHOUT_GPA_MIN })
  semestersWithoutGpaRules: number;
}

export class CreateUniversityRequirements {
  @IsInt({ message: ErrorEnum.REGULATION_UNI_REQ_MANDATORY_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_UNI_REQ_MANDATORY_HOURS_MIN })
  mandatoryHours: number;
}

export class CreateBasicScienceRequirements {
  @IsInt({ message: ErrorEnum.REGULATION_BASIC_SCI_MANDATORY_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_BASIC_SCI_MANDATORY_HOURS_MIN })
  mandatoryHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_BASIC_SCI_OPTIONAL_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_BASIC_SCI_OPTIONAL_HOURS_MIN })
  optionalHours: number;
}

export class CreateFacultyRequirements {
  @IsInt({ message: ErrorEnum.REGULATION_FACULTY_MANDATORY_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_FACULTY_MANDATORY_HOURS_MIN })
  mandatoryHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_FACULTY_OPTIONAL_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_FACULTY_OPTIONAL_HOURS_MIN })
  optionalHours: number;
}

export class CreateGradProjectRequirements {
  @IsInt({ message: ErrorEnum.REGULATION_GRAD_PROJECT_REQUIRED_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_GRAD_PROJECT_REQUIRED_HOURS_MIN })
  requiredHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_GRAD_PROJECT_CREDIT_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_GRAD_PROJECT_CREDIT_HOURS_MIN })
  creditHours: number;
}

export class CreateTrainingRequirements {
  @IsInt({ message: ErrorEnum.REGULATION_TRAINING_REQUIRED_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_TRAINING_REQUIRED_HOURS_MIN })
  requiredHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_TRAINING_CREDIT_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_TRAINING_CREDIT_HOURS_MIN })
  creditHours: number;
}

export class CreateSpecializationRequirements {
  @IsInt({ message: ErrorEnum.REGULATION_SPEC_REQ_REQUIRED_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_SPEC_REQ_REQUIRED_HOURS_MIN })
  requiredHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_SPEC_REQ_MANDATORY_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_SPEC_REQ_MANDATORY_HOURS_MIN })
  mandatoryHours: number;

  @IsInt({ message: ErrorEnum.REGULATION_SPEC_REQ_OPTIONAL_HOURS_INT })
  @Min(0, { message: ErrorEnum.REGULATION_SPEC_REQ_OPTIONAL_HOURS_MIN })
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
