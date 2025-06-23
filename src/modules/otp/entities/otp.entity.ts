import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Otp {
  @PrimaryColumn('uuid')
  userId: User['id'];

  @OneToOne(() => User, (user) => user.otp, { onDelete: "CASCADE"})
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  value: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
