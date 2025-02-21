import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Regulation } from './regulation.entity';

@Entity()
export class CourseGpaRange extends BaseEntity {
  @Column()
  from: number;

  @Column()
  to: number;

  @Column({ type: 'float' })
  gpa: number;

  @Column()
  name: string;

  @ManyToOne(() => Regulation, (regulation) => regulation.courseGpaRanges, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  regulation: Regulation;
}
