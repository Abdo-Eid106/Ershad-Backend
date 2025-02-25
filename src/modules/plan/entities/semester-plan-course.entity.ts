import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { SemesterPlan } from './semester-plan.entity';
import { Course } from 'src/modules/course/entites/course.entity';
import { UUID } from 'crypto';

@Entity()
export class SemesterPlanCourse {
  @PrimaryColumn('uuid')
  semesterPlanId: UUID;

  @PrimaryColumn('uuid')
  courseId: UUID;

  @ManyToOne(
    () => SemesterPlan,
    (semesterPlan) => semesterPlan.semesterPlanCourses,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'semesterPlanId' })
  semesterPlan: SemesterPlan;

  @ManyToOne(() => Course, (course) => course.semesterPlanCourses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'courseId' })
  course: Course;
}
