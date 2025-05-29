import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Registration } from './registration.entity';
import { Course } from 'src/modules/course/entites/course.entity';

@Entity()
export class RegistrationCourse {
  @PrimaryColumn('uuid')
  courseId: Course['id'];

  @PrimaryColumn('uuid')
  registrationId: Registration['academicInfoId'];

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
