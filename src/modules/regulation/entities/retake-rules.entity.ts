import { Entity, Column, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Regulation } from './regulation.entity';

@Entity()
export class RetakeRules extends BaseEntity {
  @Column()
  maxRetakeGrade: number;

  @Column()
  maxRetakeCourses: number;

  @OneToOne(() => Regulation, (regulation) => regulation.retakeRules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  regulation: Regulation;
}
