import { BaseEntity } from 'src/shared/entities/Base.entity';
import { PlanCourse } from './plan-course.entity';
import { Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Program } from 'src/modules/program/entities/program.entitiy';

@Entity()
export class Plan extends BaseEntity {
  @OneToOne(() => Program, (program) => program.plan, { onDelete: 'CASCADE' })
  @JoinColumn()
  program: Program;

  @OneToMany(() => PlanCourse, (planCourse) => planCourse.plan)
  planCourses: PlanCourse[];
}
