import { Course } from 'src/modules/course/entites/course.entity';
import { Program } from 'src/modules/program/entities/program.entitiy';
import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class GradProject extends BaseEntity {
  @OneToOne(() => Course, (course) => course.gradProject)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @OneToOne(() => Program, (program) => program.gradProject)
  @JoinColumn({ name: 'programId' })
  program: Program;
}
