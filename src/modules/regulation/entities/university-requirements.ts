import { Entity, Column, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Regulation } from './regulation.entity';

@Entity()
export class UniversityRequirements extends BaseEntity {
  @Column()
  mandatoryHours: number;

  @OneToOne(
    () => Regulation,
    (regulation) => regulation.universityRequirements,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  regulation: Regulation;
}
