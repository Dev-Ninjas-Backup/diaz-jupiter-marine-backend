import { ALL_PERMISSIONS } from '@/common/enum/permission.enum';
import {
  RequirePermission,
  ValidateSuperAdminOnly,
} from '@/common/jwt/jwt.decorator';
import { PermissionEnum } from '@/common/enum/permission.enum';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AdminUserResponseDto,
  CreateAdminUserDto,
  UpdatePermissionsDto,
} from './dto/admin.dto';
import { changeRole } from './enum/changerole.enum';
import { UserPermissionsService } from './user-permissions.services';

@ApiTags('Admin -- User Permissions')
@Controller('user-permissions')
export class UserPermissionsController {
  constructor(
    private readonly userPermissionsServices: UserPermissionsService,
  ) {}

  // ── Read all available permissions (SUPER_ADMIN or admins with USER_VIEW) ─

  @Get('available-permissions')
  @RequirePermission(PermissionEnum.USER_VIEW)
  @ApiOperation({
    summary: 'List all available permission keys',
    description:
      'Returns every permission value that can be assigned to an ADMIN user. ' +
      'Use this to populate the permission selection UI when creating/editing admins.',
  })
  @ApiResponse({ status: 200, description: 'List of all permission strings' })
  getAvailablePermissions() {
    return {
      status: 'success',
      total: ALL_PERMISSIONS.length,
      permissions: ALL_PERMISSIONS,
    };
  }

  // ── List admins ────────────────────────────────────────────────────────────

  @Get('get-admins')
  @RequirePermission(PermissionEnum.USER_VIEW)
  @ApiOperation({
    summary: 'Retrieve list of all admin users with their permissions',
  })
  @ApiResponse({ status: 200, type: [AdminUserResponseDto] })
  async getAdminUsers() {
    return this.userPermissionsServices.getAdmins();
  }

  // ── Create admin ───────────────────────────────────────────────────────────

  @Post('add-admin')
  @RequirePermission(PermissionEnum.USER_CREATE)
  @ApiOperation({
    summary: 'Create a new admin user',
    description:
      'SUPER_ADMIN or any admin with USER_CREATE permission can create admins. ' +
      'Include a `permissions` array to define what the new ADMIN can access. ' +
      'Ignored if the new user is a SUPER_ADMIN.',
  })
  @ApiBody({ type: CreateAdminUserDto })
  @ApiResponse({ status: 201, type: AdminUserResponseDto })
  @ApiResponse({
    status: 409,
    description: 'Email or username already exists.',
  })
  async addAdmin(@Body() createAdminUserDto: CreateAdminUserDto) {
    return this.userPermissionsServices.addAdmin(createAdminUserDto);
  }

  // ── Update admin permissions (SUPER_ADMIN only) ───────────────────────────

  @Patch(':id/permissions')
  @ValidateSuperAdminOnly()
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update an admin's permissions (SUPER_ADMIN only)",
    description:
      'Replaces the entire permissions array for the given admin user. ' +
      'Has no effect on SUPER_ADMIN users (they have all permissions by design).',
  })
  @ApiParam({ name: 'id', description: 'Admin user UUID' })
  @ApiBody({ type: UpdatePermissionsDto })
  @ApiResponse({ status: 200, description: 'Permissions updated.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updatePermissions(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionsDto,
  ) {
    return this.userPermissionsServices.updatePermissions(id, dto.permissions);
  }

  // ── Change role (SUPER_ADMIN only) ────────────────────────────────────────

  @Patch(':id')
  @ValidateSuperAdminOnly()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change role of a user (SUPER_ADMIN only)' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiQuery({ name: 'changerole', enum: changeRole })
  @ApiResponse({ status: 200, description: 'Role updated.' })
  @ApiResponse({ status: 400, description: 'Invalid role.' })
  async changeRole(
    @Query('changerole') role: changeRole,
    @Param('id') id: string,
  ) {
    if (!role || !Object.values(changeRole).includes(role)) {
      throw new BadRequestException(
        `Invalid role. Allowed values: ${Object.values(changeRole).join(', ')}`,
      );
    }
    return this.userPermissionsServices.changeRole(id, role);
  }

  // ── Delete admin ───────────────────────────────────────────────────────────

  @Delete(':id')
  @RequirePermission(PermissionEnum.USER_DELETE)
  @ApiOperation({ summary: 'Soft-delete an admin user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Admin removed.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async deleteAdmin(@Param('id') id: string) {
    return this.userPermissionsServices.deleteAdmin(id);
  }
}
