import { UUID } from 'crypto';
import { RoleEnum } from 'src/modules/role/enums/role.enum';

export interface IPayloud {
  id: UUID;
  role: RoleEnum;
}
