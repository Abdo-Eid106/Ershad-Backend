import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Student } from 'src/modules/student/entities/student.entity';
import { Gender } from 'src/shared/enums/gender.enum';
import { UUID } from 'crypto';

@Entity()
export class PersonalInfo {
  @PrimaryColumn('uuid')
  studentId: UUID;

  @Column({ type: 'json' })
  name: { en: string; ar: string };

  @Column()
  nationalId: string;

  @Column()
  universityId: string;

  @Column({ enum: Gender, type: 'enum' })
  gender: Gender;

  @Column()
  phone: string;

  @Column({ nullable: true })
  avatar?: string;

  @OneToOne(() => Student, (student) => student.personalInfo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;
}
