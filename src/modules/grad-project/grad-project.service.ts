import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Course } from '../course/entites/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateCourseDto } from '../course/dto';
import { Program } from '../program/entities/program.entitiy';
import { RequirementCourse } from '../requirement/entities/requirement-course.entity';
import { RequirementCategory } from '../requirement/enums/requirement-category.enum';
import { GradProject } from './entites/grad-project.entity';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';
import { Regulation } from '../regulation/entities';

@Injectable()
export class GradProjectService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(GradProject)
    private readonly gradProjectRepo: Repository<GradProject>,
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(
    programId: Program['id'],
    createGradProjectDto: CreateCourseDto,
  ) {
    const programExist = await this.programRepo.existsBy({ id: programId });
    if (!programExist) {
      throw new NotFoundException(ErrorEnum.PROGRAM_NOT_FOUND);
    }

    const gradProjectExist = await this.gradProjectRepo.existsBy({
      program: { id: programId },
    });
    if (gradProjectExist) {
      throw new ConflictException(ErrorEnum.COURSE_ALREADY_EXISTS);
    }

    const courseExist = await this.courseRepo.existsBy({
      code: createGradProjectDto.code,
    });
    if (courseExist) {
      throw new ConflictException(ErrorEnum.COURSE_ALREADY_EXISTS);
    }

    const { regulationId } = await this.programRepo
      .createQueryBuilder('program')
      .innerJoin('program.regulation', 'regulation')
      .select('regulation.id', 'regulationId')
      .where('program.id = :programId', { programId })
      .getRawOne<{ regulationId: Regulation['id'] }>();

    return this.entityManager.transaction(async (transaction) => {
      const course = await transaction.save(
        transaction.create(Course, createGradProjectDto),
      );

      await transaction.save(
        transaction.create(GradProject, {
          course,
          program: { id: programId },
        }),
      );

      return transaction.save(
        transaction.create(RequirementCourse, {
          regulation: { id: regulationId },
          program: { id: programId },
          course,
          category: RequirementCategory.SPECIALIZATION,
          optional: false,
        }),
      );
    });
  }

  async findOne(programId: Program['id']) {
    const course = await this.courseRepo
      .createQueryBuilder('course')
      .innerJoin('course.gradProject', 'gradProject')
      .innerJoin('gradProject.program', 'program')
      .where('program.id = :programId', { programId })
      .getOne();

    if (!course) {
      throw new NotFoundException(ErrorEnum.COURSES_NOT_EXIST);
    }

    return course;
  }

  async update(
    programId: Program['id'],
    updateGradProjectDto: CreateCourseDto,
  ) {
    const course = await this.findOne(programId);

    if (
      course.code != updateGradProjectDto.code &&
      (await this.courseRepo.existsBy({ code: updateGradProjectDto.code }))
    )
      throw new ConflictException(ErrorEnum.COURSE_ALREADY_EXISTS);

    return this.courseRepo.save({ ...course, ...updateGradProjectDto });
  }
}
