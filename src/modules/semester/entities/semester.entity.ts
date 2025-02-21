import { AcademicInfo } from 'src/modules/academic-info/entities/academic-info.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { SemesterCourse } from './semester-course.entity';
import { BaseEntity } from 'src/shared/entities/Base.entity';

@Entity()
export class Semester extends BaseEntity {
  @Column()
  semester: number;

  @Column()
  startYear: number;

  @Column()
  endYear: number;

  @ManyToOne(() => AcademicInfo, (academicInfo) => academicInfo.semesters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'academicInfoId' })
  academicInfo: AcademicInfo;

  @OneToMany(() => SemesterCourse, (semesterCourse) => semesterCourse.semester)
  semesterCourses: SemesterCourse[];
}
