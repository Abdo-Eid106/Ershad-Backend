import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPayloud } from 'src/shared/interfaces/payloud.interface';
import { User } from 'src/modules/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payloud: IPayloud) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .innerJoin('user.role', 'role')
      .select(['user.id AS id', 'user.email AS email', 'role.name AS role'])
      .where('user.id = :id', { id: payloud.id })
      .getRawOne();
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
