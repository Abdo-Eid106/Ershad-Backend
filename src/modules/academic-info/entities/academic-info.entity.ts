import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Student } from '../../student/entities/student.entity';
import { Semester } from 'src/modules/semester/entities/semester.entity';
import { Regulation } from 'src/modules/regulation/entities';

@Entity()
export class AcademicInfo {
  @PrimaryColumn('uuid')
  studentId: string;

  @OneToOne(() => Student, (student) => student.academicInfo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => Regulation, (regulation) => regulation.academicInfos, {
    onDelete: 'SET NULL',
  })
  regulation?: Regulation;

  @OneToMany(() => Semester, (semester) => semester.academicInfo)
  semesters: Semester[];
}
