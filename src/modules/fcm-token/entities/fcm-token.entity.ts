import { User } from 'src/modules/user/entities/user.entity';
import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class FcmToken extends BaseEntity {
  @ManyToOne(() => User, (user) => user.fcmTokens)
  user: User;

  @Column()
  token: string;
}
