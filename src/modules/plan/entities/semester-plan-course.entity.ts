import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { SemesterPlan } from './semester-plan.entity';
import { Course } from 'src/modules/course/entites/course.entity';
import { Plan } from './plan.entity';

@Entity()
export class SemesterPlanCourse {
  @PrimaryColumn('uuid')
  semesterPlanId: Plan['programId'];

  @PrimaryColumn('uuid')
  courseId: Course['id'];

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
