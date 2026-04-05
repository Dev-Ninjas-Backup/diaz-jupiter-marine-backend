import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ENVEnum } from '../enum/env.enum';
import { JWTPayload, JWTSignPayload } from './jwt.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const jwtSecret = config.getOrThrow<string>(ENVEnum.JWT_SECRET);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JWTSignPayload): Promise<JWTPayload> {
    const user = await this.prisma.client.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        isLoggedIn: true,
        permissions: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isLoggedIn) {
      throw new ForbiddenException('User is not logged in');
    }

    // Update last active timestamp (non-blocking)
    this.prisma.client.user
      .update({
        where: { id: payload.sub },
        data: { lastActiveAt: new Date() },
      })
      .catch(() => undefined);

    // Always return fresh role + permissions from DB so changes take effect immediately
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };
  }
}
