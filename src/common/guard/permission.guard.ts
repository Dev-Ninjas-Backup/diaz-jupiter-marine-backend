import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionEnum } from '../enum/permission.enum';
import { UserEnum } from '../enum/user.enum';
import { PERMISSION_KEY } from '../jwt/jwt.constants';
import { RequestWithUser } from '../jwt/jwt.interface';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<PermissionEnum>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No permission metadata — this guard is a no-op; JWT guard already authenticated
    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    // SUPER_ADMIN bypasses all permission checks
    if (user.role === UserEnum.SUPER_ADMIN) return true;

    // ADMIN must have the required permission in their permissions array
    if (!user.permissions?.includes(requiredPermission)) {
      throw new ForbiddenException(
        `Access denied. Required permission: ${requiredPermission}`,
      );
    }

    return true;
  }
}
