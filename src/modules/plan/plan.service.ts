import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { PlanValidationService } from './plan-validation.service';
import { SemesterPlan } from './entities/semester-plan.entity';
import { SemesterPlanCourse } from './entities/semester-plan-course.entity';
import { getCourseWithPreFragment } from '../course/fragments';
import { AcademicInfo } from '../academic-info/entities/academic-info.entity';
import { User } from '../user/entities/user.entity';
import { Program } from '../program/entities/program.entitiy';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

@Injectable()
export class PlanService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
    @InjectRepository(SemesterPlan)
    private readonly semesterPlanRepo: Repository<SemesterPlan>,
    @InjectRepository(SemesterPlanCourse)
    private readonly semesterPlanCourseRepo: Repository<SemesterPlanCourse>,
    @InjectRepository(AcademicInfo)
    private readonly academicInfoRepo: Repository<AcademicInfo>,
    private readonly planValidationService: PlanValidationService,
  ) {}

  private async savePlan(
    programId: Program['id'],
    planDto: CreatePlanDto,
    isUpdate = false,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (isUpdate) {
        const plan = await queryRunner.manager.findOneBy(Plan, { programId });
        if (plan) await queryRunner.manager.remove(plan);
      }

      // Create the plan
      const plan = await queryRunner.manager.save(
        this.planRepo.create({ programId }),
      );

      // Create semester plans
      const semesterPlans = await queryRunner.manager.save(
        this.semesterPlanRepo.create(
          planDto.semesters.map((semesterPlan) => ({
            ...semesterPlan,
            plan,
          })),
        ),
      );

      const mp = new Map<string, SemesterPlan>();
      semesterPlans.forEach((semesterPlan) =>
        mp.set(`${semesterPlan.level}-${semesterPlan.semester}`, semesterPlan),
      );

      // Create semester plan courses
      const semesterPlanCourses = planDto.semesters.flatMap((semesterPlan) =>
        semesterPlan.courseIds.map((courseId) =>
          this.semesterPlanCourseRepo.create({
            courseId,
            semesterPlan: mp.get(
              `${semesterPlan.level}-${semesterPlan.semester}`,
            ),
          }),
        ),
      );

      // Save semester plan courses inside the transaction
      await queryRunner.manager.save(semesterPlanCourses);

      // Commit transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async create(programId: Program['id'], createPlanDto: CreatePlanDto) {
    await this.planValidationService.validate(programId, createPlanDto);
    await this.savePlan(programId, createPlanDto);
  }

  async update(planId: Program['id'], updatePlanDto: CreatePlanDto) {
    await this.planValidationService.validate(planId, updatePlanDto, true);
    return this.savePlan(planId, updatePlanDto, true);
  }

  async findOne(programId: Program['id']) {
    const plan = await this.planRepo
      .createQueryBuilder('plan')
      .innerJoin('plan.semesterPlans', 'semesterPlan')
      .innerJoin('semesterPlan.semesterPlanCourses', 'semesterPlanCourse')
      .innerJoin('semesterPlanCourse.course', 'course')
      .leftJoin('course.prerequisite', 'prerequisite')
      .where('plan.programId = :programId', { programId })
      .groupBy('semesterPlan.id')
      .select([
        'semesterPlan.level AS level',
        'semesterPlan.semester AS semester',
        getCourseWithPreFragment('course', 'prerequisite'),
      ])
      .orderBy('semesterPlan.level', 'ASC')
      .addOrderBy('semesterPlan.semester', 'ASC')
      .getRawMany();

    if (plan.length === 0) {
      throw new NotFoundException(ErrorEnum.PLAN_NOT_FOUND);
    }

    return plan;
  }

  async getStudentPlan(studentId: User['id']) {
    const plan =
      (await this.getProgramPlan(studentId)) ||
      (await this.getAlternativeProgramPlan(studentId));
    if (!plan) throw new NotFoundException(ErrorEnum.PLAN_NOT_FOUND);
    return this.findOne(plan.programId);
  }

  async getProgramPlan(studentId: User['id']) {
    const plan = await this.academicInfoRepo
      .createQueryBuilder('ac')
      .innerJoin('ac.program', 'program')
      .innerJoin('program.plan', 'plan')
      .where('ac.studentId = :studentId', { studentId })
      .select('plan.programId AS programId')
      .getRawOne();

    return plan as Plan;
  }

  async getAlternativeProgramPlan(studentId: User['id']) {
    const plan = await this.academicInfoRepo
      .createQueryBuilder('ac')
      .innerJoin('ac.regulation', 'regulation')
      .innerJoin('regulation.programs', 'program')
      .innerJoin('program.plan', 'plan')
      .where('ac.studentId = :studentId', { studentId })
      .andWhere('plan.programId IS NOT NULL')
      .select('plan.programId AS programId')
      .getRawOne();

    return plan as Plan;
  }
}
