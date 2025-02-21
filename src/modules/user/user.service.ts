import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdatePasswordDto } from './dto/update-password';
import { compare, hash } from 'bcrypt';
import { UUID } from 'crypto';
import { RolesGuard } from '../role/guards/roles.guard';

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

    const newPassword = await hash(updatePasswordDto.newPassword, 12);
    return this.userRepo.save({ ...user, passoword: newPassword });
  }
}
