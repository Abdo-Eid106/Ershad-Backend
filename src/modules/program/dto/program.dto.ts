import { Expose } from 'class-transformer';
import { Program } from '../entities/program.entitiy';

export class ProgramDto {
  @Expose()
  id: Program['id'];

  @Expose()
  name: { en: string; ar: string };

  @Expose()
  code: string;

  @Expose()
  degree: string;

  @Expose()
  levels?: number;

  @Expose()
  hasPlan?: boolean;

  @Expose()
  hasGradProject?: boolean;
}
