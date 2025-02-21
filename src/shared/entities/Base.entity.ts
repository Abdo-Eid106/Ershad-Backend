import { UUID } from 'crypto';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
} from 'typeorm';

@Entity()
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt?: Date;
}
