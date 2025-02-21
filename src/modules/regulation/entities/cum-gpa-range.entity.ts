import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Regulation } from './regulation.entity';

@Entity()
export class CumGpaRange extends BaseEntity {
  @Column({ type: 'float' })
  from: number;

  @Column({ type: 'float' })
  to: number;

  @Column()
  name: string;

  @ManyToOne(() => Regulation, (regulation) => regulation.cumGpaRanges, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  regulation: Regulation;
}
