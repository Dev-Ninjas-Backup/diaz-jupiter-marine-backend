import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { SiteType } from 'generated/enums';
import { CreatePartnerDto } from '../dto/create-partner.dto';
import { UpdatePartnerDto } from '../dto/update-partner.dto';

@Injectable()
export class PartnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  async create(dto: CreatePartnerDto, logo?: Express.Multer.File) {
    let logoId: string | null = null;

    if (logo) {
      const uploaded = await this.s3.uploadFiles([logo]);
      logoId = uploaded.data.files[0].id;
    }

    const createData: any = {
      name: dto.name,
      description: dto.description || null,
      link: dto.link || null,
      site: dto.site,
      logoId: logoId ?? undefined,
    };

    return this.prisma.client.partner.create({
      data: createData,
      include: {
        logo: true,
      },
    });
  }

  async update(id: string, dto: UpdatePartnerDto, logo?: Express.Multer.File) {
    await this.findOne(id);

    let newFileId: string | undefined;

    if (logo) {
      const uploaded = await this.s3.uploadFiles([logo]);
      newFileId = uploaded.data.files[0].id;
    }

    const updateData: any = {
      name: dto.name ?? undefined,
      description: dto.description !== undefined ? dto.description : undefined,
      link: dto.link !== undefined ? dto.link : undefined,
      site: dto.site ?? undefined,
      logoId: newFileId ?? undefined,
    };

    return this.prisma.client.partner.update({
      where: { id },
      data: updateData,
      include: { logo: true },
    });
  }

  async findAll(site?: SiteType) {
    return this.prisma.client.partner.findMany({
      where: site ? { site } : undefined,
      include: { logo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const partner = await this.prisma.client.partner.findUnique({
      where: { id },
      include: { logo: true },
    });

    if (!partner) throw new NotFoundException('Partner not found');
    return partner;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.partner.delete({
      where: { id },
    });
  }
}
