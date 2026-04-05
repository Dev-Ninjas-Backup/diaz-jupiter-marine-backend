import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PermissionEnum } from '../enum/permission.enum';
import { UserEnum } from '../enum/user.enum';
import { PermissionGuard } from '../guard/permission.guard';
import { IS_PUBLIC_KEY, PERMISSION_KEY, ROLES_KEY } from './jwt.constants';
import { JwtAuthGuard, RolesGuard } from './jwt.guard';
import { JWTPayload, RequestWithUser } from './jwt.interface';

// ── Metadata helpers ────────────────────────────────────────────────────────

export const Roles = (...roles: UserEnum[]) => SetMetadata(ROLES_KEY, roles);

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const Permission = (perm: PermissionEnum) =>
  SetMetadata(PERMISSION_KEY, perm);

// ── Param decorator ─────────────────────────────────────────────────────────

export const GetUser = createParamDecorator(
  (data: keyof JWTPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user as JWTPayload | undefined;
    if (!user) return undefined;
    if (!data) return user;
    return user[data];
  },
);

// ── Composite auth decorators ────────────────────────────────────────────────

/** JWT auth + optional role check. */
export function ValidateAuth(...roles: UserEnum[]) {
  const decorators = [UseGuards(JwtAuthGuard, RolesGuard)];
  if (roles.length > 0) {
    decorators.push(Roles(...roles));
  }
  return applyDecorators(...decorators);
}

/** Requires SUPER_ADMIN or ADMIN role (role-level check only, no permission). */
export function ValidateSuperAdmin() {
  return ValidateAuth(UserEnum.SUPER_ADMIN, UserEnum.ADMIN);
}

/** Requires SUPER_ADMIN role only. */
export function ValidateSuperAdminOnly() {
  return ValidateAuth(UserEnum.SUPER_ADMIN);
}

/** Requires ADMIN or SUPER_ADMIN role (same as ValidateSuperAdmin). */
export function ValidateAdmin() {
  return ValidateAuth(UserEnum.ADMIN, UserEnum.SUPER_ADMIN);
}

// ── Permission-based decorator ───────────────────────────────────────────────

/**
 * Applies JWT auth + permission check.
 *
 * - SUPER_ADMIN: always allowed (bypasses permission check).
 * - ADMIN: allowed only if their `permissions` array includes the given permission.
 *
 * Usage: @RequirePermission(PermissionEnum.BLOG_MANAGE)
 */
export function RequirePermission(permission: PermissionEnum) {
  return applyDecorators(
    SetMetadata(PERMISSION_KEY, permission),
    UseGuards(JwtAuthGuard, PermissionGuard),
    ApiBearerAuth(),
  );
}
