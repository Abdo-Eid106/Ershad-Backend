import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';
import { Repository } from 'typeorm';
import { UpdateAcademicInfoDto } from './dto/update-academic-info.dto';
import { AcademicInfo } from './entities/academic-info.entity';
import { AcademicInfoValidationService } from './academic-info-validation.service';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entites/course.entity';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';
import { SemesterService } from '../semester/semester.service';
import { Semester } from '../semester/entities/semester.entity';
import { Plan } from '../plan/entities/plan.entity';
import { RegistrationSettings } from '../registration/entities/registration-settings.entity';
import { Program } from '../program/entities/program.entitiy';

@Injectable()
export class AcademicInfoService {
  constructor(
    @InjectRepository(Semester)
    private readonly semesterRepo: Repository<Semester>,
    @InjectRepository(AcademicInfo)
    private readonly academicInfoRepo: Repository<AcademicInfo>,
    @InjectRepository(RegistrationSettings)
    private readonly registrationSettingsRepo: Repository<RegistrationSettings>,
    @Inject(forwardRef(() => AcademicInfoValidationService))
    private readonly academicInfoValidationService: AcademicInfoValidationService,
    private readonly semesterService: SemesterService,
  ) {}

  async getAcademicInfo(studentId: Student['userId']) {
    const academicInfo = await this.academicInfoRepo.findOne({
      where: { studentId },
      relations: ['regulation', 'regulation.academicRequirements', 'program'],
    });
    if (!academicInfo) throw new NotFoundException(ErrorEnum.STUDENT_NOT_FOUND);

    const attemptedHours = await this.getAttemptedHours(studentId);
    const gainedHours = await this.getGainedHours(studentId);
    const gpa = await this.semesterService.getStudentGpa(studentId);
    const level = await this.getLevel(studentId);

    return {
      attemptedHours,
      gainedHours,
      gpa,
      level,
      regulation: academicInfo.regulation,
      program: academicInfo.program,
    };
  }

  async update(
    studentId: User['id'],
    updateAcademicInfoDto: UpdateAcademicInfoDto,
  ) {
    await this.academicInfoValidationService.validate(
      studentId,
      updateAcademicInfoDto,
    );
    const { regulationId, programId } = updateAcademicInfoDto;

    return this.academicInfoRepo.update(
      { studentId },
      { regulation: { id: regulationId }, program: { id: programId } },
    );
  }

  async getMinGpaToGraduate(studentId: User['id']) {
    const { minGpaForGraduation } = await this.academicInfoRepo
      .createQueryBuilder('academicInfo')
      .innerJoin('academicInfo.regulation', 'regulation')
      .innerJoin('regulation.dismissalRules', 'dismissalRules')
      .select('dismissalRules.minGpaForGraduation', 'minGpaForGraduation')
      .where('academicInfo.studentId = :studentId', { studentId })
      .getRawOne<{ minGpaForGraduation: number }>();

    return minGpaForGraduation;
  }

  async getLevel(studentId: User['id']) {
    const gainedHours = await this.getGainedHours(studentId);
    const { level } = await this.academicInfoRepo
      .createQueryBuilder('academicInfo')
      .innerJoin('academicInfo.regulation', 'regulation')
      .innerJoin('regulation.levels', 'level')
      .groupBy('regulation.id')
      .where('level.reqHours <= :gainedHours', { gainedHours })
      .select('MAX(level.value)', 'level')
      .getRawOne<{ level: number }>();

    return level;
  }

  async getAttemptedHours(studentId: User['id']) {
    const semesterCourses = await this.academicInfoRepo
      .createQueryBuilder('academicInfo')
      .leftJoin('academicInfo.semesters', 'semester')
      .leftJoin('semester.semesterCourses', 'semesterCourse')
      .innerJoin('semesterCourse.course', 'course')
      .where('academicInfo.studentId = :studentId', { studentId })
      .select('course.creditHours', 'creditHours')
      .getRawMany<{ creditHours: number }>();

    return semesterCourses.reduce(
      (sum, semesterCourse) => sum + semesterCourse.creditHours,
      0,
    );
  }

  async getGainedHours(studentId: User['id']) {
    const successDegree = await this.getSuccessDegree(studentId);

    const semesterCourses = await this.academicInfoRepo
      .createQueryBuilder('academicInfo')
      .leftJoin('academicInfo.semesters', 'semester')
      .leftJoin('semester.semesterCourses', 'semesterCourse')
      .innerJoin('semesterCourse.course', 'course')
      .where('academicInfo.studentId = :studentId', { studentId })
      .groupBy('course.id')
      .select('course.id', 'id')
      .addSelect('course.creditHours', 'creditHours')
      .addSelect('MAX(semesterCourse.degree)', 'degree')
      .getRawMany<{ id: Course['id']; creditHours: number; degree: number }>();

    return semesterCourses.reduce(
      (sum, semesterCourse) =>
        sum +
        (semesterCourse.degree >= successDegree
          ? semesterCourse.creditHours
          : 0),
      0,
    );
  }

  async getSuccessDegree(studentId: User['id']) {
    const { degree } = await this.academicInfoRepo
      .createQueryBuilder('academicInfo')
      .innerJoin('academicInfo.regulation', 'regulation')
      .innerJoin('regulation.courseGpaRanges', 'range')
      .select('range.to', 'degree')
      .where('academicInfo.studentId = :studentId', { studentId })
      .andWhere('range.gpa = 0')
      .getRawOne<{ degree: number }>();

    return degree + 1;
  }

  async getPassedCourseIds(studentId: User['id']) {
    const successDegree = await this.getSuccessDegree(studentId);

    const courses = await this.academicInfoRepo
      .createQueryBuilder('academicInfo')
      .innerJoin('academicInfo.semesters', 'semester')
      .innerJoin('semester.semesterCourses', 'semesterCourse')
      .where('semesterCourse.degree >= :successDegree', { successDegree })
      .andWhere('academicInfo.studentId = :studentId', { studentId })
      .select('DISTINCT semesterCourse.courseId', 'id')
      .getRawMany<{ id: Course['id'] }>();

    return courses.map((res) => res.id);
  }

  async isUnderGpaRules(studentId: User['id']) {
    const semesters = await this.semesterRepo
      .createQueryBuilder('semester')
      .innerJoin('semester.academicInfo', 'academicInfo')
      .where('academicInfo.studentId = :studentId', { studentId })
      .getCount();

    const { semestersWithoutGpaRules } = await this.academicInfoRepo
      .createQueryBuilder('academicInfo')
      .innerJoin('academicInfo.regulation', 'regulation')
      .innerJoin('regulation.academicRequirements', 'academicRequirements')
      .where('academicInfo.studentId = :studentId', { studentId })
      .select(
        'academicRequirements.semestersWithoutGpaRules',
        'semestersWithoutGpaRules',
      )
      .getRawOne<{ semestersWithoutGpaRules: number }>();

    return semesters >= semestersWithoutGpaRules;
  }

  async getRegistrationHoursRange(studentId: User['id']) {
    const regstrationSettings = await this.registrationSettingsRepo.findOne({
      where: {},
    });

    if (regstrationSettings.semester == 3) {
      const { summerTermHours } = await this.academicInfoRepo
        .createQueryBuilder('academicInfo')
        .innerJoin('academicInfo.regulation', 'regulation')
        .innerJoin('regulation.registrationRules', 'rs')
        .where('academicInfo.studentId = :studentId', { studentId })
        .select('rs.summerTermHours', 'summerTermHours')
        .getRawOne<{ summerTermHours: number }>();

      return [0, summerTermHours] as const;
    }

    const gpa = await this.semesterService.getStudentGpa(studentId);
    const isUnderGpaRules = await this.isUnderGpaRules(studentId);

    const {
      normalRegistrationHours,
      maxRegistrationHours,
      minRegistrationHours,
      gpaForMaxHours,
      minGpaForGraduation,
    } = await this.academicInfoRepo
      .createQueryBuilder('academicInfo')
      .innerJoin('academicInfo.regulation', 'regulation')
      .innerJoin('regulation.registrationRules', 'rs')
      .innerJoin('regulation.dismissalRules', 'ds')
      .where('academicInfo.studentId = :studentId', { studentId })
      .select('rs.normalRegistrationHours', 'normalRegistrationHours')
      .addSelect('rs.minRegistrationHours', 'minRegistrationHours')
      .addSelect('rs.maxRegistrationHours', 'maxRegistrationHours')
      .addSelect('rs.gpaForMaxHours', 'gpaForMaxHours')
      .addSelect('ds.minGpaForGraduation', 'minGpaForGraduation')
      .getRawOne<{
        normalRegistrationHours: number;
        maxRegistrationHours: number;
        minRegistrationHours: number;
        gpaForMaxHours: number;
        minGpaForGraduation: number;
      }>();

    if (!isUnderGpaRules) {
      return [normalRegistrationHours, normalRegistrationHours] as const;
    }

    return [
      minRegistrationHours,
      gpa >= gpaForMaxHours
        ? maxRegistrationHours
        : gpa >= minGpaForGraduation
          ? normalRegistrationHours
          : minRegistrationHours,
    ] as const;
  }

  async getMaxAllowedRetakes(studentId: User['id']) {
    const { maxRetakeCourses } = await this.academicInfoRepo
      .createQueryBuilder('academicInfo')
      .innerJoin('academicInfo.regulation', 'regulation')
      .innerJoin('regulation.retakeRules', 'retakeRules')
      .where('academicInfo.studentId = :studentId', { studentId })
      .select('retakeRules.maxRetakeCourses', 'maxRetakeCourses')
      .getRawOne<{ maxRetakeCourses: number }>();

    return maxRetakeCourses;
  }

  async getRequiredHoursForSpecialization(studentId: User['id']) {
    const { requiredHours } = await this.academicInfoRepo
      .createQueryBuilder('academicInfo')
      .innerJoin('academicInfo.regulation', 'regulation')
      .innerJoin(
        'regulation.specializationRequirements',
        'specializationRequirements',
      )
      .select('specializationRequirements.requiredHours', 'requiredHours')
      .where('academicInfo.studentId = :studentId', { studentId })
      .getRawOne<{ requiredHours: number }>();

    return requiredHours;
  }

  async getRequiredHoursToTakeGradProject(studentId: User['id']) {
    const { requiredHoursToTakeGradProject } = await this.academicInfoRepo
      .createQueryBuilder('academicInfo')
      .innerJoin('academicInfo.regulation', 'regulation')
      .innerJoin(
        'regulation.specializationRequirements',
        'specializationRequirements',
      )
      .innerJoin(
        'specializationRequirements.gradProjectRequirements',
        'gradProjectRequirements',
      )
      .select(
        'gradProjectRequirements.requiredHours',
        'requiredHoursToTakeGradProject',
      )
      .where('academicInfo.studentId = :studentId', { studentId })
      .getRawOne<{ requiredHoursToTakeGradProject: number }>();

    return requiredHoursToTakeGradProject;
  }

  async getPreviousRetakeAttempts(studentId: User['id']) {
    const { totalAttempts, uniqueCourses } = await this.academicInfoRepo
      .createQueryBuilder('academicInfo')
      .innerJoin('academicInfo.semesters', 'semester')
      .innerJoin('semester.semesterCourses', 'semesterCourse')
      .where('academicInfo.studentId = :studentId', { studentId })
      .select('COUNT(semesterCourse.courseId)', 'totalAttempts')
      .addSelect('COUNT(DISTINCT semesterCourse.courseId)', 'uniqueCourses')
      .getRawOne<{ totalAttempts: number; uniqueCourses: number }>();

    return totalAttempts - uniqueCourses;
  }

  async canStudentRetakeCoursesWithoutLimit(studentId: User['id']) {
    const gpa = await this.semesterService.getStudentGpa(studentId);
    const minGpaForGraduation = await this.getMinGpaToGraduate(studentId);
    return gpa < minGpaForGraduation;
  }

  async getStudentPlanId(studentId: User['id']) {
    let plan = await this.academicInfoRepo
      .createQueryBuilder('academicInfo')
      .innerJoin('academicInfo.program', 'program')
      .innerJoin('program.plan', 'plan')
      .where('academicInfo.studentId = :studentId', { studentId })
      .select('plan.programId', 'programId')
      .getRawOne<{ programId: Plan['programId'] }>();
    if (plan) return plan.programId;

    plan = await this.academicInfoRepo
      .createQueryBuilder('academicInfo')
      .innerJoin('academicInfo.regulation', 'regulation')
      .innerJoin('regulation.programs', 'program')
      .innerJoin('program.plan', 'plan')
      .where('academicInfo.studentId = :studentId', { studentId })
      .select('plan.programId', 'programId')
      .getRawOne<{ programId: Plan['programId'] }>();

    if (plan) return plan.programId;
    return null;
  }

  async getStudentProgramId(
    studentId: User['id'],
  ): Promise<Program['id'] | null> {
    const program = await this.academicInfoRepo
      .createQueryBuilder('academicInfo')
      .innerJoin('academicInfo.program', 'program')
      .where('academicInfo.studentId = :studentId', { studentId })
      .select('program.id', 'id')
      .getRawOne<{ id: Course['id'] }>();

    if (!program) return null;
    return program.id;
  }

  async getStudentGradProjectId(
    studentId: User['id'],
  ): Promise<Course['id'] | null> {
    const course = await this.academicInfoRepo
      .createQueryBuilder('academicInfo')
      .innerJoin('academicInfo.program', 'program')
      .innerJoin('program.gradProject', 'gradProject')
      .where('academicInfo.studentId = :studentId', { studentId })
      .select('gradProject.courseId', 'id')
      .getRawOne<{ id: Course['id'] }>();

    if (!course) return null;
    return course.id;
  }
}
