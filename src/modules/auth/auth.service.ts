import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { LoginInput } from './dto';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginInput: LoginInput) {
    const { email, password } = loginInput;
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user || !(await compare(password, user.password)))
      throw new UnauthorizedException('email or password is incorrect');

    const token = await this.jwtService.signAsync({ id: user.id });
    return { token, user };
  }
}
