import { IsOptional, IsUUID } from 'class-validator';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';
import { Regulation } from 'src/modules/regulation/entities';
import { Program } from 'src/modules/program/entities/program.entitiy';

export class UpdateAcademicInfoDto {
  @IsUUID('4', { message: ErrorEnum.REGULATION_ID_UUID })
  regulationId: Regulation['id'];

  @IsUUID('4', { message: ErrorEnum.PROGRAM_ID_UUID })
  @IsOptional()
  programId?: Program['id'];
}
