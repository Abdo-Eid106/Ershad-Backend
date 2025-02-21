import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { CreatePlanCourse, CreatePlanDto } from './dto/create-plan.dto';
import { Program } from '../program/entities/program.entitiy';
import { CourseService } from '../course/course.service';
import { PlanCourse } from './entities/plan-course.entity';
import { PlanDto } from './dto/plan.dto';
import { UUID } from 'crypto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
    @InjectRepository(PlanCourse)
    private readonly planCourseRepo: Repository<PlanCourse>,
    private readonly courseService: CourseService,
  ) {}

  async create(createPlanDto: CreatePlanDto) {
    const { programId, planCourses } = createPlanDto;

    const program = await this.programRepo.findOne({
      where: { id: programId },
    });
    if (!program) throw new NotFoundException('Program not found');

    if (await this.planRepo.existsBy({ program: { id: programId } })) {
      throw new ConflictException('Plan already exists');
    }

    await this.validatePlanCourses(programId, planCourses);

    const plan = await this.planRepo.save(
      this.planRepo.create({
        ...createPlanDto,
        program,
      }),
    );

    await this.createPlanCourses(planCourses, plan.id);
    return this.findOne(plan.id);
  }

  async update(id: UUID, updatePlanDto: UpdatePlanDto) {
    const { planCourses } = updatePlanDto;
    const plan = await this.planRepo.findOne({
      where: { id },
      relations: ['program'],
    });
    if (!plan) throw new NotFoundException('Plan Not Found');

    await this.validatePlanCourses(plan.program.id, updatePlanDto.planCourses);
    await this.createPlanCourses(planCourses, plan.id);
    return this.findOne(plan.id);
  }

  async findOne(id: UUID): Promise<PlanDto> {
    const plan = await this.planRepo.findOne({
      where: { id },
      relations: ['planCourses', 'planCourses.course', 'program'],
    });
    if (!plan) throw new NotFoundException('plan not found');

    const result = await this.planRepo
      .createQueryBuilder('plan')
      .innerJoin('plan.program', 'program')
      .innerJoin('program.regulation', 'regulation')
      .innerJoin('regulation.academicRequirements', 'ac')
      .select('ac.levelsCount', 'levels')
      .addSelect('program.name', 'programName')
      .where('plan.id = :id', { id })
      .getRawOne();

    return { ...plan, ...result };
  }

  async remove(id: UUID) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('plan not found');
    return this.planRepo.remove(plan);
  }

  private async getLevelsCountByProgramId(programId: UUID): Promise<number> {
    const result = await this.programRepo
      .createQueryBuilder('program')
      .innerJoin('program.regulation', 'regulation')
      .innerJoin('regulation.academicRequirements', 'requirements')
      .select('requirements.levelsCount', 'levelsCount')
      .where('program.id = :programId', { programId })
      .getRawOne();

    return result.levelsCount;
  }

  private async validatePlanCourses(
    programId: UUID,
    planCourses: CreatePlanCourse[],
  ) {
    //check for duplicate courses
    const courseIds = [
      ...new Set(planCourses.map((planCourses) => planCourses.courseId)),
    ];
    if (courseIds.length != planCourses.length)
      throw new BadRequestException('duplicate courses');

    //check that the courses exist
    await this.courseService.findByIds(courseIds);

    //check the level of the courses
    const levelsCount = await this.getLevelsCountByProgramId(programId);
    if (planCourses.some((planCourse) => planCourse.level > levelsCount)) {
      throw new BadRequestException(
        `Course level cannot exceed the maximum program level of ${levelsCount}`,
      );
    }
  }

  private async createPlanCourses(
    planCourses: CreatePlanCourse[],
    planId: UUID,
  ) {
    await this.planCourseRepo.remove(
      await this.planCourseRepo.find({ where: { plan: { id: planId } } }),
    );

    return this.planCourseRepo.save(
      planCourses.map((planCourse) => ({
        ...planCourse,
        course: { id: planCourse.courseId },
        plan: { id: planId },
      })),
    );
  }
}
