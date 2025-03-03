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

    const user = await this.userRepo
      .createQueryBuilder('user')
      .innerJoin('user.role', 'role')
      .select([
        'user.id AS id',
        'user.email AS email',
        'user.password AS password',
        'role.name AS role',
      ])
      .where('user.email = :email', { email })
      .getRawOne();

    if (!user || !(await compare(password, user.password)))
      throw new UnauthorizedException('email or password is incorrect');

    const token = await this.jwtService.signAsync({
      id: user.id,
      role: user.role,
    });
    return { token, user };
  }
}
