import { AcademicInfo } from 'src/modules/academic-info/entities/academic-info.entity';
import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { RegistrationCourse } from './registration-course.entity';

@Entity()
export class Registration {
  @PrimaryColumn('uuid')
  academicInfoId: AcademicInfo['studentId'];

  @OneToOne(() => AcademicInfo, (academicInfo) => academicInfo.registration)
  @JoinColumn({ name: 'academicInfoId' })
  academicInfo: AcademicInfo;

  @OneToMany(
    () => RegistrationCourse,
    (regsitrationCourse) => regsitrationCourse.registration,
  )
  registrationCourses: RegistrationCourse[];
}
