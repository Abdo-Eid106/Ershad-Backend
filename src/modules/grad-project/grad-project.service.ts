import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Course } from '../course/entites/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
  import { UUID } from 'crypto';
import { CreateCourseDto } from '../course/dto';
import { Program } from '../program/entities/program.entitiy';
import { RequirementCourse } from '../requirement/entities/requirement-course.entity';
import { RequirementCategory } from '../requirement/enums/requirement-category.enum';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

@Injectable()
export class GradProjectService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(programId: Program['id'], createGradProjectDto: CreateCourseDto) {
    if (!(await this.programRepo.existsBy({ id: programId })))
      throw new NotFoundException(ErrorEnum.PROGRAM_NOT_FOUND);

    const course = await this.courseRepo.findOne({
      where: { id: programId },
    });
    if (course) throw new ConflictException(ErrorEnum.COURSE_ALREADY_EXISTS);

    if (await this.courseRepo.existsBy({ code: createGradProjectDto.code }))
      throw new ConflictException(ErrorEnum.COURSE_ALREADY_EXISTS);

    const { regulationId } = await this.programRepo
      .createQueryBuilder('program')
      .innerJoin('program.regulation', 'regulation')
      .select('regulation.id AS regulationId')
      .where('program.id = :programId', { programId })
      .getRawOne();

    return this.entityManager.transaction(async (transaction) => {
      await transaction.save(
        transaction.create(Course, {
          id: programId,
          ...createGradProjectDto,
        }),
      );

      return transaction.save(
        transaction.create(RequirementCourse, {
          regulation: { id: regulationId },
          program: { id: programId },
          course: { id: programId },
          category: RequirementCategory.SPECIALIZATION,
          optional: false,
        }),
      );
    });
  }

  async findOne(programId: Program['id']) {
    const course = await this.courseRepo.findOne({ where: { id: programId } });
    if (!course) throw new NotFoundException(ErrorEnum.GRAD_PROJECT_NOT_FOUND);
    return course;
  }

  async update(programId: Program['id'], updateGradProjectDto: CreateCourseDto) {
    const course = await this.findOne(programId);

    if (
      course.code != updateGradProjectDto.code &&
      (await this.courseRepo.existsBy({ code: updateGradProjectDto.code }))
    )
      throw new ConflictException(ErrorEnum.COURSE_ALREADY_EXISTS);

    return this.courseRepo.save({ ...course, ...updateGradProjectDto });
  }
}
