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
import { UUID } from 'crypto';
import { Course } from '../course/entites/course.entity';
import { Plan } from './entities/plan.entity';

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
    programId: UUID,
    createPlanDto: CreatePlanDto,
    isUpdate?: boolean,
  ) {
    const { semesters } = createPlanDto;

    const planExist = await this.doesPlanExist(programId);
    if (!isUpdate && planExist)
      throw new ConflictException(
        `A plan already exists for the program with ID: ${programId}`,
      );

    if (isUpdate && !planExist) throw new NotFoundException(`plan not found`);

    if (!(await this.doesProgramExist(programId)))
      throw new NotFoundException(
        `Program with ID: ${programId} not found. Please provide a valid program.`,
      );

    const maxLevels = await this.getProgramTotalLevels(programId);
    if (!this.areSemesterLevelsValid(semesters, maxLevels))
      throw new BadRequestException(
        `Invalid semester levels detected. A semester's level cannot exceed ${maxLevels}.`,
      );

    if (!this.areAllSemestersProvided(semesters, maxLevels))
      throw new BadRequestException(
        `Incomplete semester data. You must provide all semesters for each level up to ${maxLevels}.`,
      );

    if (this.hasEmptySemester(semesters))
      throw new BadRequestException(
        `A semester cannot be empty. Each semester must have at least one course.`,
      );

    const courseIds = semesters.flatMap(
      (planSemester) => planSemester.courseIds,
    );

    if (this.hasDuplicateCourses(courseIds))
      throw new BadRequestException(
        `Duplicate courses found within the plan. Each course should only appear once.`,
      );

    if (!(await this.doAllCoursesExist(courseIds)))
      throw new NotFoundException(
        `One or more courses in the plan do not exist. Please verify course IDs.`,
      );

    return true;
  }

  async doesPlanExist(programId: UUID) {
    return this.planRepo.existsBy({ programId });
  }

  async doesProgramExist(programId: UUID) {
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

  hasDuplicateCourses(courseIds: UUID[]) {
    return new Set(courseIds).size !== courseIds.length;
  }

  async doAllCoursesExist(courseIds: UUID[]) {
    const count = await this.courseRepo
      .createQueryBuilder('course')
      .where('course.id IN (:...courseIds)', { courseIds })
      .getCount();
    return count === courseIds.length;
  }

  async getProgramTotalLevels(programId: UUID) {
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
