import { BaseEntity } from 'src/shared/entities/Base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class RegistrationSettings extends BaseEntity {
  @Column({ default: false })
  isOpen: boolean;

  @Column({ default: 1 })
  semester: number;
}
