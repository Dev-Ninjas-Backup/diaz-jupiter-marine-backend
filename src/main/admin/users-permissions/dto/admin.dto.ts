import { ALL_PERMISSIONS, PermissionEnum } from '@/common/enum/permission.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from 'generated/enums';

export class GetAdminUsersDto {
  @ApiProperty({ example: '123456789' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'johndoe@gmail.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'ADMIN', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ isArray: true, enum: PermissionEnum })
  permissions: string[];
}

export class CreateAdminUserDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Unique email address of the admin',
  })
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Unique username (alphanumeric + underscore only)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @ApiProperty({
    example: 'SuperSecret123!',
    description:
      'Strong password: min 8 chars, must contain uppercase, lowercase, number, and symbol',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must contain a lowercase letter',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain an uppercase letter',
  })
  @Matches(/(?=.*\d)/, { message: 'Password must contain a number' })
  @Matches(/(?=.*[@$!%*?&])/, {
    message: 'Password must contain a special character',
  })
  password: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  googleId?: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the admin user',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.ADMIN,
    description: 'Role assigned to the user',
    default: UserRole.ADMIN,
  })
  @IsEnum(UserRole, { message: 'Valid role is required' })
  @IsNotEmpty()
  role: UserRole;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiPropertyOptional({
    isArray: true,
    enum: PermissionEnum,
    description:
      'Permissions to assign. Ignored when role is SUPER_ADMIN (they have all permissions). ' +
      `Available values: ${ALL_PERMISSIONS.join(', ')}`,
    example: [PermissionEnum.DASHBOARD_VIEW, PermissionEnum.BLOG_MANAGE],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PermissionEnum, { each: true })
  permissions?: PermissionEnum[];
}

export class UpdatePermissionsDto {
  @ApiProperty({
    isArray: true,
    enum: PermissionEnum,
    description: 'Complete list of permissions to assign to the admin user.',
    example: [
      PermissionEnum.DASHBOARD_VIEW,
      PermissionEnum.BLOG_MANAGE,
      PermissionEnum.LEADS_VIEW,
    ],
  })
  @IsArray()
  @IsEnum(PermissionEnum, { each: true })
  permissions: PermissionEnum[];
}

export class AdminUserResponseDto {
  @ApiProperty({ example: '123456789' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'admin@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'johndoe' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  googleId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ isArray: true, enum: PermissionEnum })
  permissions: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  zip?: string;
}
