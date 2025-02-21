import { Entity, Column, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Regulation } from './regulation.entity';

@Entity()
export class AcademicRequirements extends BaseEntity {
  @Column()
  regulationHours: number;

  @Column()
  levelsCount: number;

  @Column()
  semestersWithoutGpaRules: number;

  @OneToOne(() => Regulation, (regulation) => regulation.academicRequirements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  regulation: Regulation;
}
