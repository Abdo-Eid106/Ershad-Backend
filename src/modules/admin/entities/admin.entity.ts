import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Admin {
  @PrimaryColumn('uuid')
  userId: User['id'];

  @Column({ type: 'json' })
  name: { en: string; ar: string };

  @OneToOne(() => User, (user) => user.admin, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
