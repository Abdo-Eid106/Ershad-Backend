import { Course } from 'src/modules/course/entites/course.entity';
import { Program } from 'src/modules/program/entities/program.entitiy';
import { Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class GradProject {
  @PrimaryColumn('uuid')
  courseId: Course['id'];

  @OneToOne(() => Course, (course) => course.gradProject)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @OneToOne(() => Program, (program) => program.gradProject)
  @JoinColumn({ name: 'programId' })
  program: Program;
}
