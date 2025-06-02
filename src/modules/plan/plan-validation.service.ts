import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Program } from '../program/entities/program.entitiy';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePlanDto, CreateSemesterPlan } from './dto/create-plan.dto';
import { Course } from '../course/entites/course.entity';
import { Plan } from './entities/plan.entity';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

@Injectable()
export class PlanValidationService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) {}

  async validate(
    programId: Program['id'],
    createPlanDto: CreatePlanDto,
    isUpdate?: boolean,
  ) {
    const { semesters } = createPlanDto;

    const planExist = await this.doesPlanExist(programId);
    if (!isUpdate && planExist)
      throw new ConflictException(ErrorEnum.PLAN_ALREADY_EXISTS);

    if (isUpdate && !planExist)
      throw new NotFoundException(ErrorEnum.PLAN_NOT_FOUND);

    if (!(await this.doesProgramExist(programId)))
      throw new NotFoundException(ErrorEnum.PROGRAM_NOT_FOUND);

    const maxLevels = await this.getProgramTotalLevels(programId);
    if (!this.areSemesterLevelsValid(semesters, maxLevels))
      throw new BadRequestException(ErrorEnum.INVALID_SEMESTER_LEVELS);

    if (!this.areAllSemestersProvided(semesters, maxLevels))
      throw new BadRequestException(ErrorEnum.INCOMPLETE_SEMESTER_DATA);

    if (this.hasEmptySemester(semesters))
      throw new BadRequestException(ErrorEnum.EMPTY_SEMESTER);

    const courseIds = semesters.flatMap(
      (planSemester) => planSemester.courseIds,
    );

    if (this.hasDuplicateCourses(courseIds))
      throw new BadRequestException(ErrorEnum.DUPLICATE_COURSES);

    if (!(await this.doAllCoursesExist(courseIds)))
      throw new NotFoundException(ErrorEnum.COURSE_NOT_FOUND);

    return true;
  }

  async doesPlanExist(programId: Program['id']) {
    return this.planRepo.existsBy({ programId });
  }

  async doesProgramExist(programId: Program['id']) {
    return this.programRepo.existsBy({ id: programId });
  }

  areSemesterLevelsValid(
    planSemesters: CreateSemesterPlan[],
    maxLevel: number,
  ) {
    return planSemesters.every((semester) => semester.level <= maxLevel);
  }

  areAllSemestersProvided(
    planSemesters: CreateSemesterPlan[],
    totalLevels: number,
  ) {
    return Array.from({ length: totalLevels }, (_, i) => i + 1).every((level) =>
      [1, 2].every((semester) =>
        planSemesters.some(
          (plan) => plan.level === level && plan.semester === semester,
        ),
      ),
    );
  }

  hasEmptySemester(planSemesters: CreateSemesterPlan[]) {
    return planSemesters.some((semester) => semester.courseIds.length === 0);
  }

  hasDuplicateCourses(courseIds: Course['id'][]) {
    return new Set(courseIds).size !== courseIds.length;
  }

  async doAllCoursesExist(courseIds: Course['id'][]) {
    const count = await this.courseRepo
      .createQueryBuilder('course')
      .where('course.id IN (:...courseIds)', { courseIds })
      .getCount();
    return count === courseIds.length;
  }

  async getProgramTotalLevels(programId: Program['id']) {
    const { levelsCount } = await this.programRepo
      .createQueryBuilder('program')
      .innerJoin('program.regulation', 'regulation')
      .innerJoin('regulation.academicRequirements', 'ac')
      .where('program.id = :programId', { programId })
      .select('ac.levelsCount', 'levelsCount')
      .getRawOne();
    return levelsCount;
  }
}
