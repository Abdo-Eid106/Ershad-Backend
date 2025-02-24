import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequirementCategory } from './enums/requirement-category.enum';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { Repository } from 'typeorm';
import { Regulation } from '../regulation/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from '../course/entites/course.entity';
import { RequirementCourse } from './entities/requirement-course.entity';
import { Program } from '../program/entities/program.entitiy';
import { UUID } from 'crypto';
import { GetRequiremetsDto } from './dto/get-requirements.dto';

@Injectable()
export class RequirementService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(Regulation)
    private readonly regulationRepo: Repository<Regulation>,
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
    @InjectRepository(RequirementCourse)
    private readonly requirementCourseRepo: Repository<RequirementCourse>,
  ) {}

  async create(createRequirementDto: CreateRequirementDto) {
    const { courseId, regulationId, category, programId } =
      createRequirementDto;

    const course = await this.courseRepo.findOne({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('course not found');

    const regulation = await this.regulationRepo.findOne({
      where: { id: regulationId },
    });
    if (!regulation) throw new NotFoundException('regulation not found');

    if (
      category == RequirementCategory.SPECIALIZATION &&
      (await this.programRepo.existsBy({ id: programId }))
    )
      throw new NotFoundException('program not found');

    const exist = await this.requirementCourseRepo
      .createQueryBuilder('requirementCourse')
      .innerJoin('requirementCourse.regulation', 'regulation')
      .where('regulation.id = :regulationId', { regulationId })
      .andWhere('requirementCourse.courseId = :courseId', { courseId })
      .getExists();
    if (exist) throw new ConflictException('requirement already exist');

    return this.requirementCourseRepo.save(
      this.requirementCourseRepo.create({
        ...createRequirementDto,
        course,
        regulation,
      }),
    );
  }

  async findMany(getRequiremetsDto: GetRequiremetsDto) {
    const { optional, regulationId, category } = getRequiremetsDto;

    return this.requirementCourseRepo
      .createQueryBuilder('requirement')
      .leftJoinAndSelect('requirement.course', 'course')
      .leftJoinAndSelect('course.prerequisite', 'prerequisite')
      .where('requirement.regulationId = :regulationId', { regulationId })
      .andWhere('requirement.optional = :optional', {
        optional: optional.toLowerCase() == 'true',
      })
      .andWhere('requirement.category = :category', { category })
      .getMany();
  }

  async remove(id: UUID) {
    const requirement = await this.requirementCourseRepo.findOne({
      where: { id },
    });
    console.log('requirement = ', requirement);

    if (!requirement) throw new NotFoundException('requirement not found');
    return this.requirementCourseRepo.remove(requirement);
  }
}
