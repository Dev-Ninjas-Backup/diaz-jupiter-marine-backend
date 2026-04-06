import { Expose } from 'class-transformer';
import { UserRole, UserStatus } from 'generated/client';

export class UserResponseDto {
  @Expose()
  id: string;

  // ===== Auth =====
  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  googleId?: string;

  @Expose()
  phone?: string;

  // ===== Profile =====
  @Expose()
  name: string;

  @Expose()
  avatarUrl: string;

  // ===== Address =====
  @Expose()
  country?: string;

  @Expose()
  city?: string;

  @Expose()
  state?: string;

  @Expose()
  zip?: string;

  // ===== Settings =====
  @Expose()
  role: UserRole;

  @Expose()
  permissions: string[];

  @Expose()
  status: UserStatus;

  @Expose()
  isVerified: boolean;

  // ===== Activity tracking =====
  @Expose()
  isLoggedIn: boolean;

  @Expose()
  lastLoginAt?: Date;

  @Expose()
  lastLogoutAt?: Date;

  @Expose()
  lastActiveAt?: Date;

  // ===== Meta =====
  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
