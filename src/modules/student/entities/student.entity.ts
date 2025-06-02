import { User } from 'src/modules/user/entities/user.entity';
import { Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { PersonalInfo } from 'src/modules/personal-info/entities/personal-info.entity';
import { AcademicInfo } from '../../academic-info/entities/academic-info.entity';

@Entity()
export class Student {
  @PrimaryColumn('uuid')
  userId: User['id'];

  @OneToOne(() => User, (user) => user.student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => PersonalInfo, (personalInfo) => personalInfo.student)
  personalInfo: PersonalInfo;

  @OneToOne(() => AcademicInfo, (academicInfo) => academicInfo.student)
  academicInfo: AcademicInfo;
}
