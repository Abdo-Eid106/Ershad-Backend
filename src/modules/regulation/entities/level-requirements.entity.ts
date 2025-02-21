import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Regulation } from './regulation.entity';

@Entity()
export class Level extends BaseEntity {
  @Column()
  value: number;

  @Column()
  reqHours: number;

  @ManyToOne(() => Regulation, (regulation) => regulation.levels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  regulation: Regulation;
}
