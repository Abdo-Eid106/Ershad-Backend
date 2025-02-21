import { Entity, Column, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Regulation } from './regulation.entity';

@Entity()
export class DismissalRules extends BaseEntity {
  @Column()
  maxConsecutiveWarnings: number;

  @Column()
  maxYearsLevelOne: number;

  @Column({ type: 'float' })
  minGpaForGraduation: number;

  @OneToOne(() => Regulation, (regulation) => regulation.dismissalRules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  regulation: Regulation;
}
