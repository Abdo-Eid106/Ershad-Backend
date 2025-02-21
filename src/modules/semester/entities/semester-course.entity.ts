import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Semester } from './semester.entity';
import { Course } from 'src/modules/course/entites/course.entity';
import { BaseEntity } from 'src/shared/entities/Base.entity';

@Entity()
export class SemesterCourse extends BaseEntity {
  @ManyToOne(() => Semester, (semester) => semester.semesterCourses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'semesterId' })
  semester: Semester;

  @ManyToOne(() => Course, (course) => course.semesterCourses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  degree: number;
}
