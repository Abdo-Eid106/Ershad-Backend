import { GradProject } from 'src/modules/grad-project/entites/grad-project.entity';
import { SemesterPlanCourse } from 'src/modules/plan/entities/semester-plan-course.entity';
import { RegistrationCourse } from 'src/modules/registration/entities/registration-course.entity';
import { RequirementCourse } from 'src/modules/requirement/entities/requirement-course.entity';
import { SemesterCourse } from 'src/modules/semester/entities/semester-course.entity';
import { BaseEntity } from 'src/shared/entities/Base.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity()
export class Course extends BaseEntity {
  @Column({ type: 'json' })
  name: { en: string; ar: string };

  @Column({ unique: true })
  code: string;

  @Column()
  lectureHours: number;

  @Column()
  practicalHours: number;

  @Column()
  creditHours: number;

  @Column({ type: 'text' })
  description: string;

  @Column()
  level: number;

  @ManyToOne(() => Course, (course) => course.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'prerequisiteId' })
  prerequisite?: Course;

  @OneToMany(
    () => RequirementCourse,
    (requirementCourse) => requirementCourse.course,
  )
  requirementCourses: RequirementCourse;

  @OneToMany(() => SemesterCourse, (semesterCourse) => semesterCourse.course)
  semesterCourses: SemesterCourse[];

  @OneToMany(
    () => RegistrationCourse,
    (regsitrationCourse) => regsitrationCourse.course,
  )
  registrationCourses: RegistrationCourse[];

  @OneToMany(
    () => SemesterPlanCourse,
    (semesterPlanCourse) => semesterPlanCourse.course,
  )
  semesterPlanCourses: SemesterPlanCourse[];

  @OneToOne(() => GradProject, (gradProject) => gradProject.course)
  gradProject?: GradProject;
}
