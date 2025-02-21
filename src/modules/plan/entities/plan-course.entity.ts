import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Plan } from './plan.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Course } from 'src/modules/course/entites/course.entity';

@Entity()
export class PlanCourse extends BaseEntity {
  @Column()
  semester: number;

  @Column()
  level: number;

  @ManyToOne(() => Plan, (plan) => plan.planCourses, { onDelete: 'CASCADE' })
  plan: Plan;

  @ManyToOne(() => Course, (course) => course.planCourses, {
    onDelete: 'CASCADE',
  })
  course: Course;
}
