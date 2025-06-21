import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import { LoginInput, ResetPasswordInput } from './dto';
import { compare, hash } from 'bcrypt';
import { Otp } from '../otp/entities/otp.entity';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async login(loginInput: LoginInput) {
    const { email, password } = loginInput;

    const user = await this.userRepo
      .createQueryBuilder('user')
      .innerJoin('user.role', 'role')
      .select('user.id', 'id')
      .addSelect('user.email', 'email')
      .addSelect('user.password', 'password')
      .addSelect('role.name', 'role')
      .where('user.email = :email', { email })
      .getRawOne();

    if (!user || !(await compare(password, user.password)))
      throw new UnauthorizedException(ErrorEnum.INVALID_CREDENTIALS);

    const token = await this.jwtService.signAsync({
      id: user.id,
      role: user.role,
    });
    return { token, user };
  }

  async resetPassword(resetPasswordInput: ResetPasswordInput) {
    const { email, otp, password } = resetPasswordInput;

    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { email },
        relations: ['otp'],
      });

      if (!user) throw new NotFoundException(ErrorEnum.USER_NOT_FOUND);

      if (
        !user.otp ||
        user.otp.expiresAt < new Date() ||
        !(await compare(otp, user.otp.value))
      ) {
        throw new BadRequestException(ErrorEnum.INVALID_OTP);
      }

      user.password = await hash(password, 12);
      await manager.save(user);
      await manager.remove(Otp, user.otp);
    });
  }
}
