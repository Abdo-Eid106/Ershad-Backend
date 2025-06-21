import { Course } from 'src/modules/course/entites/course.entity';
import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class GradProject extends BaseEntity {
  @OneToOne(() => Course, (course) => course.gradProject)
  @JoinColumn({ name: 'courseId' })
  course: Course;
}
