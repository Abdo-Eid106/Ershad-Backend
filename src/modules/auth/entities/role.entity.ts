import { User } from 'src/modules/user/entities/user.entity';
import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { RoleEnum } from '../enums/role.enum';

@Entity()
export class Role extends BaseEntity {
  @OneToMany(() => User, (user) => user.role)
  user: User;

  @Column({ type: 'enum', enum: RoleEnum })
  name: RoleEnum;
}
