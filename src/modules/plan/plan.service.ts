import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UUID } from 'crypto';
import { PlanValidationService } from './plan-validation.service';
import { SemesterPlan } from './entities/semester-plan.entity';
import { SemesterPlanCourse } from './entities/semester-plan-course.entity';
import { getCourseWithPreFragment } from '../course/fragments';

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
    private readonly planValidationService: PlanValidationService,
  ) {}

  private async savePlan(
    programId: UUID,
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

  async create(programId: UUID, createPlanDto: CreatePlanDto) {
    await this.planValidationService.validate(programId, createPlanDto);
    await this.savePlan(programId, createPlanDto);
  }

  async update(planId: UUID, updatePlanDto: CreatePlanDto) {
    await this.planValidationService.validate(planId, updatePlanDto, true);
    return this.savePlan(planId, updatePlanDto, true);
  }

  async findOne(id: UUID) {
    const plan = await this.planRepo
      .createQueryBuilder('plan')
      .innerJoin('plan.semesterPlans', 'semesterPlan')
      .innerJoin('semesterPlan.semesterPlanCourses', 'semesterPlanCourse')
      .innerJoin('semesterPlanCourse.course', 'course')
      .leftJoin('course.prerequisite', 'prerequisite')
      .where('plan.programId = :id', { id })
      .groupBy('semesterPlan.id')
      .select([
        'semesterPlan.level AS level',
        'semesterPlan.semester AS semester',
        getCourseWithPreFragment('course', 'prerequisite'),
      ])
      .getRawMany();

    if (plan.length === 0) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }
}
