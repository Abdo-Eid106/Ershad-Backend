import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Regulation } from './regulation.entity';
import { BaseEntity } from 'src/shared/entities/Base.entity';

@Entity()
export class BasicScienceRequirements extends BaseEntity {
  @Column()
  mandatoryHours: number;

  @Column()
  optionalHours: number;

  @OneToOne(
    () => Regulation,
    (regulation) => regulation.basicScienceRequirements,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  regulation: Regulation;
}
