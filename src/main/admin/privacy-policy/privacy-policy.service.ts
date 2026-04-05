import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreatePrivacyPolicyDto,
  UpdatePrivacyPolicyDto,
} from './dto/privacy-policy.dto';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { SiteType } from 'generated/enums';
import { Prisma } from 'generated/client';

@Injectable()
export class PrivacyPolicyService {
  private readonly logger = new Logger(PrivacyPolicyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPrivacyPolicy(site: SiteType) {
    try {
      const policy = await this.prisma.client.privacyPolicy.findFirst({
        where: { site },
        select: {
          id: true,
          site: true,
          privacyTitle: true,
          privacyDescription: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!policy) {
        throw new NotFoundException(
          `Privacy policy for site ${site} not found`,
        );
      }

      return policy;
    } catch (error) {
      this.logger.error('Error getting Privacy Policy:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to get Privacy Policy';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async createPrivacyPolicy(
    site: SiteType,
    createPrivacyPolicyDto: CreatePrivacyPolicyDto,
  ) {
    try {
      // Check if Privacy Policy already exists for this site
      const existing = await this.prisma.client.privacyPolicy.findFirst({
        where: { site },
        select: { id: true },
      });

      if (existing) {
        throw new BadRequestException(
          `Privacy Policy for site ${site} already exists. Use PATCH method to update.`,
        );
      }

      const result = await this.prisma.client.privacyPolicy.create({
        data: {
          site,
          privacyTitle: createPrivacyPolicyDto.privacyTitle,
          privacyDescription: createPrivacyPolicyDto.privacyDescription,
        },
        select: {
          id: true,
          site: true,
          privacyTitle: true,
          privacyDescription: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return result;
    } catch (error) {
      this.logger.error('Error creating Privacy Policy:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            `Privacy Policy for site ${site} already exists. Use PATCH method to update.`,
          );
        }
        this.logger.error('Prisma error code:', error.code);
        this.logger.error('Prisma error meta:', error.meta);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create Privacy Policy';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async updatePrivacyPolicy(
    site: SiteType,
    updatePrivacyPolicyDto: UpdatePrivacyPolicyDto,
  ) {
    try {
      // Get the existing Privacy Policy for this site
      const existing = await this.prisma.client.privacyPolicy.findUnique({
        where: { site },
        select: { id: true },
      });

      if (!existing) {
        throw new NotFoundException(
          `Privacy Policy for site ${site} not found. Use POST method to create.`,
        );
      }

      // Build update data object, only including fields that are provided
      const updateData: {
        privacyTitle?: string;
        privacyDescription?: string;
      } = {};
      if (updatePrivacyPolicyDto.privacyTitle !== undefined) {
        updateData.privacyTitle = updatePrivacyPolicyDto.privacyTitle;
      }
      if (updatePrivacyPolicyDto.privacyDescription !== undefined) {
        updateData.privacyDescription =
          updatePrivacyPolicyDto.privacyDescription;
      }

      const result = await this.prisma.client.privacyPolicy.update({
        where: { site },
        data: updateData,
        select: {
          id: true,
          site: true,
          privacyTitle: true,
          privacyDescription: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return result;
    } catch (error) {
      this.logger.error('Error updating Privacy Policy:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error('Prisma error code:', error.code);
        this.logger.error('Prisma error meta:', error.meta);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update Privacy Policy';
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(errorMessage);
    }
  }
}
