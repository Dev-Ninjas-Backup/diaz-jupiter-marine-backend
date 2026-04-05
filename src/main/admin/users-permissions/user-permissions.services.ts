import { ALL_PERMISSIONS, PermissionEnum } from '@/common/enum/permission.enum';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { UtilsService } from '@/lib/utils/utils.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/client';
import { UserRole, UserStatus } from 'generated/enums';
import {
  AdminUserResponseDto,
  CreateAdminUserDto,
  GetAdminUsersDto,
} from './dto/admin.dto';
import { changeRole } from './enum/changerole.enum';

@Injectable()
export class UserPermissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
  ) {}

  async getAdmins(): Promise<GetAdminUsersDto[]> {
    return this.prisma.client.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        status: { in: ['ACTIVE'] },
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatarUrl: true,
        role: true,
        status: true,
        permissions: true,
        isLoggedIn: true,
        lastLoginAt: true,
        lastActiveAt: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        phone: true,
        country: true,
        city: true,
        state: true,
        zip: true,
      },
    });
  }

  async addAdmin(
    createAdminUserDto: CreateAdminUserDto,
  ): Promise<AdminUserResponseDto> {
    try {
      const { password, email, username, permissions, role, ...rest } =
        createAdminUserDto;

      const existingEmail = await this.prisma.client.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        throw new ConflictException(
          `Email '${email}' is already registered. Please use a different email address.`,
        );
      }

      const existingUsername = await this.prisma.client.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        throw new ConflictException(
          `Username '${username}' is already taken. Please choose a different username.`,
        );
      }

      const hashedPassword = await this.utils.hash(password);

      // SUPER_ADMIN gets all permissions; ADMIN gets only the ones provided
      const resolvedPermissions: string[] =
        role === UserRole.SUPER_ADMIN ? [] : (permissions ?? []);

      const user = await this.prisma.client.user.create({
        data: {
          email,
          username,
          ...rest,
          role,
          password: hashedPassword,
          isVerified: true,
          permissions: resolvedPermissions,
        },
      });

      const { password: _pw, ...userWithoutPassword } = user;
      return userWithoutPassword as AdminUserResponseDto;
    } catch (error) {
      if (error instanceof ConflictException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[] | undefined;
          if (target?.includes('email')) {
            throw new ConflictException(
              `Email '${createAdminUserDto.email}' is already registered.`,
            );
          }
          if (target?.includes('username')) {
            throw new ConflictException(
              `Username '${createAdminUserDto.username}' is already taken.`,
            );
          }
          throw new ConflictException(
            'A user with this information already exists.',
          );
        }
        throw new ConflictException(`Database error: ${error.message}`);
      }

      throw new ConflictException(
        `Failed to create admin user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async changeRole(id: string, role: changeRole) {
    const user = await this.prisma.client.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found.`);

    return this.prisma.client.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        status: true,
        permissions: true,
      },
    });
  }

  async updatePermissions(id: string, permissions: PermissionEnum[]) {
    const user = await this.prisma.client.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found.`);

    if (user.role === UserRole.SUPER_ADMIN) {
      // SUPER_ADMIN has all permissions by design — storing them is pointless but harmless
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: ALL_PERMISSIONS,
        message:
          'SUPER_ADMIN bypasses permission checks and has all permissions.',
      };
    }

    const updated = await this.prisma.client.user.update({
      where: { id },
      data: { permissions },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        status: true,
        permissions: true,
      },
    });

    return updated;
  }

  async deleteAdmin(id: string) {
    const user = await this.prisma.client.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found.`);

    return this.prisma.client.user.update({
      where: { id },
      data: { status: UserStatus.DELETED },
      select: { id: true, email: true, status: true },
    });
  }
}
