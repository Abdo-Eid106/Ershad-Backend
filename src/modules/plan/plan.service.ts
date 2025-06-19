import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { PlanValidationService } from './plan-validation.service';
import { SemesterPlan } from './entities/semester-plan.entity';
import { SemesterPlanCourse } from './entities/semester-plan-course.entity';
import { AcademicInfoService } from '../academic-info/academic-info.service';
import { User } from '../user/entities/user.entity';
import { Program } from '../program/entities/program.entitiy';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';
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
    private readonly academicInfoService: AcademicInfoService,
    private readonly planValidationService: PlanValidationService,
  ) {}

  private savePlan(
    programId: Program['id'],
    planDto: CreatePlanDto,
    isUpdate = false,
  ) {
    return this.dataSource.transaction(async (manager) => {
      if (isUpdate) {
        const existingPlan = await manager.findOne(Plan, {
          where: { programId },
        });
        if (existingPlan) {
          await manager.remove(existingPlan);
        }
      }

      const plan = await manager.save(this.planRepo.create({ programId }));

      const semesterPlans = await manager.save(
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

      return manager.save(semesterPlanCourses);
    });
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
    const planId = await this.academicInfoService.getStudentPlanId(studentId);
    return this.findOne(planId);
  }
}
