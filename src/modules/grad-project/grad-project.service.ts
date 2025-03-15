import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Course } from '../course/entites/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UUID } from 'crypto';
import { CreateCourseDto } from '../course/dto';
import { Program } from '../program/entities/program.entitiy';

@Injectable()
export class GradProjectService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,

    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
  ) {}

  async create(programId: UUID, createGradProjectDto: CreateCourseDto) {
    if (!(await this.programRepo.existsBy({ id: programId })))
      throw new NotFoundException('program not found');

    const course = await this.courseRepo.findOne({
      where: { id: programId },
    });
    if (course)
      throw new ConflictException('graduation project is already exist');

    if (await this.courseRepo.existsBy({ code: createGradProjectDto.code }))
      throw new ConflictException('there is a course with this code');

    return this.courseRepo.save(
      this.courseRepo.create({ id: programId, ...createGradProjectDto }),
    );
  }

  async findOne(programId: UUID) {
    const course = await this.courseRepo.findOne({ where: { id: programId } });
    if (!course) throw new NotFoundException('graduation project not found');
    return course;
  }

  async update(programId: UUID, updateGradProjectDto: CreateCourseDto) {
    const course = await this.findOne(programId);

    if (
      course.code != updateGradProjectDto.code &&
      (await this.courseRepo.existsBy({ code: updateGradProjectDto.code }))
    )
      throw new ConflictException('there is a course with this code');

    return this.courseRepo.save({ ...course, ...updateGradProjectDto });
  }
}
