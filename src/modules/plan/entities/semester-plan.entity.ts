import { BaseEntity } from 'src/shared/entities/Base.entity';
import { SemesterPlanCourse } from './semester-plan-course.entity';
import { Column, Entity, ManyToOne, OneToMany, Unique } from 'typeorm';
import { Plan } from './plan.entity';

@Entity()
@Unique(['plan', 'semester', 'level'])
export class SemesterPlan extends BaseEntity {
  @ManyToOne(() => Plan, (plan) => plan.semesterPlans, { onDelete: 'CASCADE' })
  plan: Plan;

  @OneToMany(
    () => SemesterPlanCourse,
    (semesterPlanCourse) => semesterPlanCourse.semesterPlan,
  )
  semesterPlanCourses: SemesterPlanCourse[];

  @Column()
  level: number;

  @Column()
  semester: number;
}
