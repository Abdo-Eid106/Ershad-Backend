import { RoleEnum } from 'src/modules/role/enums/role.enum';
import { User } from 'src/modules/user/entities/user.entity';

export interface IPayloud {
  id: User['id'];
  role: RoleEnum;
}
