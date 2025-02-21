import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Regulation } from './regulation.entity';

@Entity()
export class RegistrationRules extends BaseEntity {
  @Column()
  maxRegistrationHours: number;

  @Column()
  normalRegistrationHours: number;

  @Column()
  minRegistrationHours: number;

  @Column({ type: 'float' })
  gpaForMaxHours: number;

  @Column()
  summerTermHours: number;

  @OneToOne(() => Regulation, (regulation) => regulation.registrationRules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  regulation: Regulation;
}
