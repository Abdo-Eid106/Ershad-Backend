import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Student } from 'src/modules/student/entities/student.entity';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { Officer } from 'src/modules/officer/entities/officer.entity';
import { Role } from 'src/modules/auth/entities/role.entity';
import { Admin } from 'src/modules/admin/entities/admin.entity';
import { Otp } from 'src/modules/otp/entities/otp.entity';

@Entity()
export class User extends BaseEntity {
  @Column()
  email: string;

  @Column()
  password: string;

  @OneToOne(() => Student, (student) => student.user)
  student: Student;

  @OneToOne(() => Officer, (officer) => officer.user)
  officer: Officer;

  @OneToOne(() => Admin, (officer) => officer.user)
  admin: Admin;

  @ManyToOne(() => Role, (role) => role.user, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  role?: Role;

  @OneToOne(() => Otp, (otp) => otp.user)
  otp?: Otp;
}
