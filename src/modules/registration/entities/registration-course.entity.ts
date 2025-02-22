import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Registration } from './registration.entity';
import { Course } from 'src/modules/course/entites/course.entity';
import { UUID } from 'crypto';

@Entity()
export class RegistrationCourse {
  @PrimaryColumn('uuid')
  courseId: UUID;

  @PrimaryColumn('uuid')
  registrationId: UUID;

  @ManyToOne(
    () => Registration,
    (registeration) => registeration.registrationCourses,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'registrationId' })
  registration: Registration;

  @ManyToOne(() => Course, (course) => course.registrationCourses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'courseId' })
  course: Course;
}
