import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { RegistrationRules } from './registration-rules.entity';
import { DismissalRules } from './dissmisal-rules.entity';
import { RetakeRules } from './retake-rules.entity';
import { AcademicRequirements } from './academic-requirements.entity';
import { UniversityRequirements } from './university-requirements';
import { BasicScienceRequirements } from './basic-science-requirements.entitiy';
import { FacultyRequirements } from './faculty-requirements.entity';
import { SpecializationRequirements } from './specialization-requirements';
import { Level } from './level-requirements.entity';
import { CourseGpaRange } from './course-gpa-range.entity';
import { CumGpaRange } from './cum-gpa-range.entity';
import { Program } from 'src/modules/program/entities/program.entitiy';
import { AcademicInfo } from 'src/modules/academic-info/entities/academic-info.entity';
import { RequirementCourse } from 'src/modules/requirement/entities/requirement-course.entity';

@Entity()
export class Regulation extends BaseEntity {
  @Column({ type: 'json' })
  name: { en: string; ar: string };

  @OneToOne(
    () => RegistrationRules,
    (registrationRules) => registrationRules.regulation,
  )
  registrationRules: RegistrationRules;

  @OneToOne(() => DismissalRules, (dismissalRules) => dismissalRules.regulation)
  dismissalRules: DismissalRules;

  @OneToOne(() => RetakeRules, (retakeRules) => retakeRules.regulation)
  retakeRules: RetakeRules;

  @OneToOne(
    () => AcademicRequirements,
    (academicRequirements) => academicRequirements.regulation,
  )
  academicRequirements: AcademicRequirements;

  @OneToOne(
    () => UniversityRequirements,
    (universityRequirements) => universityRequirements.regulation,
  )
  universityRequirements: UniversityRequirements;

  @OneToOne(
    () => BasicScienceRequirements,
    (basicScienceRequirements) => basicScienceRequirements.regulation,
  )
  basicScienceRequirements: UniversityRequirements;

  @OneToOne(
    () => FacultyRequirements,
    (facultyRequirements) => facultyRequirements.regulation,
  )
  facultyRequirements: FacultyRequirements;

  @OneToOne(
    () => SpecializationRequirements,
    (specializationRequirements) => specializationRequirements.regulation,
  )
  specializationRequirements: SpecializationRequirements;

  @OneToMany(() => Level, (level) => level.regulation)
  levels: Level;

  @OneToMany(
    () => CourseGpaRange,
    (courseGpaRange) => courseGpaRange.regulation,
  )
  courseGpaRanges: CourseGpaRange;

  @OneToMany(() => CumGpaRange, (cumGpaRanges) => cumGpaRanges.regulation)
  cumGpaRanges: CumGpaRange;

  @OneToMany(() => Program, (program) => program.regulation)
  programs: Program[];

  @OneToMany(() => AcademicInfo, (academicInfo) => academicInfo.regulation)
  academicInfos: AcademicInfo[];

  @OneToMany(
    () => RequirementCourse,
    (requirementCourse) => requirementCourse.regulation,
  )
  requirementCourses: RequirementCourse[];
}
