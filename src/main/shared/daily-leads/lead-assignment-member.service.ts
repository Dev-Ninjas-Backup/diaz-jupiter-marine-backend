import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssignmentMemberDto } from './dto/create-assignment-member.dto';
import { UpdateAssignmentMemberDto } from './dto/update-assignment-member.dto';

@Injectable()
export class LeadAssignmentMemberService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    const members = await this.prisma.client.leadAssignmentMember.findMany({
      orderBy: { order: 'asc' },
    });
    return members.map(this.toResponse);
  }

  async getById(id: number) {
    const member = await this.prisma.client.leadAssignmentMember.findUnique({
      where: { id },
    });
    if (!member) throw new NotFoundException(`Member ${id} not found.`);
    return this.toResponse(member);
  }

  async create(dto: CreateAssignmentMemberDto) {
    const conflict = await this.prisma.client.leadAssignmentMember.findFirst({
      where: { OR: [{ email: dto.email }, { order: dto.order }] },
    });
    if (conflict) {
      if (conflict.email === dto.email) {
        throw new ConflictException(
          `A member with email "${dto.email}" already exists.`,
        );
      }
      throw new ConflictException(
        `Order ${dto.order} is already assigned to another member.`,
      );
    }

    const member = await this.prisma.client.leadAssignmentMember.create({
      data: { email: dto.email, name: dto.name, order: dto.order },
    });
    return this.toResponse(member);
  }

  async update(id: number, dto: UpdateAssignmentMemberDto) {
    const existing = await this.prisma.client.leadAssignmentMember.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException(`Member ${id} not found.`);

    if (dto.email != null && dto.email !== existing.email) {
      const taken = await this.prisma.client.leadAssignmentMember.findUnique({
        where: { email: dto.email },
      });
      if (taken) {
        throw new ConflictException(`Email "${dto.email}" is already in use.`);
      }
    }

    if (dto.order != null && dto.order !== existing.order) {
      const taken = await this.prisma.client.leadAssignmentMember.findUnique({
        where: { order: dto.order },
      });
      if (taken) {
        throw new ConflictException(
          `Order ${dto.order} is already taken by another member.`,
        );
      }
    }

    const updated = await this.prisma.client.leadAssignmentMember.update({
      where: { id },
      data: {
        ...(dto.email != null && { email: dto.email }),
        ...(dto.name != null && { name: dto.name }),
        ...(dto.order != null && { order: dto.order }),
        ...(dto.isActive != null && { isActive: dto.isActive }),
      },
    });
    return this.toResponse(updated);
  }

  async delete(id: number) {
    const existing = await this.prisma.client.leadAssignmentMember.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException(`Member ${id} not found.`);
    await this.prisma.client.leadAssignmentMember.delete({ where: { id } });
    return true;
  }

  private toResponse(member: {
    id: number;
    email: string;
    name: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: member.id,
      email: member.email,
      name: member.name,
      order: member.order,
      is_active: member.isActive,
      created_at: member.createdAt.toISOString(),
      updated_at: member.updatedAt.toISOString(),
    };
  }
}
