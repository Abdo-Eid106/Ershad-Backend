import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdatePasswordDto } from './dto/update-password';
import { compare, hash } from 'bcrypt';
import { UUID } from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async updatePassword(userId: UUID, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !(await compare(updatePasswordDto.oldPassword, user.password)))
      throw new BadRequestException('password is incorrect');

    if (updatePasswordDto.oldPassword === updatePasswordDto.newPassword)
      throw new BadRequestException(
        'new password must be different from the old password',
      );

    const newPassword = await hash(updatePasswordDto.newPassword, 12);
    return this.userRepo.save({ ...user, password: newPassword });
  }
}
