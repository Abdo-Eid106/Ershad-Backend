import { Expose, Transform } from 'class-transformer';
import { UUID } from 'crypto';

export class ProgramDto {
  @Expose()
  id: UUID;

  @Expose()
  name: { en: string; ar: string };

  @Expose()
  code: string;

  @Expose()
  degree: string;

  @Expose()
  levels?: number;

  @Expose()
  @Transform(({ value }) =>
    value !== undefined && value !== null
      ? value === '1' || value === 1
      : undefined,
  )
  hasPlan?: boolean;

  @Expose()
  @Transform(({ value }) =>
    value !== undefined && value !== null
      ? value === '1' || value === 1
      : undefined,
  )
  hasGradProject?: boolean;
}
