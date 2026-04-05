import { AppError } from '@/common/error/handle-error.app';
import { ParseJsonPipe } from '@/common/pipe/parse-json.pipe';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { UtilsService } from '@/lib/utils/utils.service';
import { CreateBoatsInfoDto } from '@/main/seller/boats/dto/boats-info.dto';
import {
  BoatEngineDto,
  UpdateBoatEngineDto,
} from '@/main/seller/boats/dto/boats.dto';
import { UpdateListingDtoWithImagesDto } from '@/main/seller/boats/dto/update-boats.dto';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { BoatImageType, BoatListingStatus, Prisma } from 'generated/client';

export interface QueueFile {
  path: string;
  type: BoatImageType;
  originalName: string;
}

@Injectable()
export class AdminBoatListingHelperService {
  private readonly logger = new Logger(AdminBoatListingHelperService.name);
  private readonly parsePipe = new ParseJsonPipe();

  constructor(
    private readonly utils: UtilsService,
    private readonly prisma: PrismaService,
  ) {}

  parseBoatInfo(boatInfoJson: CreateBoatsInfoDto): CreateBoatsInfoDto {
    const boatInfo = this.parsePipe.transform(boatInfoJson);
    this.logger.log('Boat Info parsed successfully');
    return boatInfo;
  }

  parseUpdateBoatInfo(
    boatInfoJson?: UpdateListingDtoWithImagesDto,
  ): UpdateListingDtoWithImagesDto {
    const boatInfo = this.parsePipe.transform(boatInfoJson);
    this.logger.log('Update Boat Info parsed successfully');
    return boatInfo;
  }

  convertDimensions(boatDimensions: CreateBoatsInfoDto['boatDimensions']) {
    const {
      lengthFeet,
      lengthInches,
      beamFeet,
      beamInches,
      draftFeet,
      draftInches,
    } = boatDimensions;

    return {
      length: this.utils.feetAndInchesToDecimal(lengthFeet, lengthInches),
      beam: this.utils.feetAndInchesToDecimal(beamFeet, beamInches),
      draft: this.utils.feetAndInchesToDecimal(draftFeet, draftInches),
    };
  }

  async getNextListingId(tx: Prisma.TransactionClient): Promise<string> {
    const PREFIX = 'JMS';
    const DIGITS = 8;

    const lastBoat = await tx.boats.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { listingId: true },
    });

    let nextNumber = 1;

    if (lastBoat?.listingId) {
      const regex = new RegExp(`^${PREFIX}(\\d{${DIGITS}})$`);
      const match = lastBoat.listingId.match(regex);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    return `${PREFIX}${String(nextNumber).padStart(DIGITS, '0')}`;
  }

  async buildBoatCreateData(
    boatInfo: CreateBoatsInfoDto,
    userId: string,
    status: BoatListingStatus,
    tx: Prisma.TransactionClient,
  ): Promise<Prisma.BoatsCreateInput> {
    const { length, beam, draft } = this.convertDimensions(
      boatInfo.boatDimensions,
    );

    const listingId = await this.getNextListingId(tx);

    return {
      listingId,
      name: boatInfo.name,
      price: boatInfo.price,
      description: boatInfo?.description?.trim() || '',
      buildYear: boatInfo.buildYear,
      make: boatInfo.make,
      model: boatInfo.model,
      fuelType: boatInfo.fuelType,
      class: boatInfo.boatClass,
      material: boatInfo.material,
      condition: boatInfo.condition,
      engineType: boatInfo?.engineType?.trim() || '',
      propType: boatInfo?.propType?.trim() || '',
      propMaterial: boatInfo?.propMaterial?.trim() || '',
      length,
      beam,
      draft,
      enginesNumber: boatInfo.enginesNumber,
      cabinsNumber: boatInfo.cabinsNumber,
      headsNumber: boatInfo.headsNumber,
      city: boatInfo.city,
      state: boatInfo.state,
      zip: boatInfo.zip,
      status,
      electronics: boatInfo.electronics || [],
      insideEquipment: boatInfo.insideEquipment || [],
      outsideEquipment: boatInfo.outsideEquipment || [],
      electricalEquipment: boatInfo.electricalEquipment || [],
      covers: boatInfo.coversEquipment || [],
      additionalEquipment: boatInfo.additionalEquipment || [],
      videoURL: boatInfo?.videoURL?.trim() || '',
      user: { connect: { id: userId } },
      engines: boatInfo.engines?.length
        ? {
            createMany: {
              data: boatInfo.engines.map((engine: BoatEngineDto) => ({
                ...engine,
              })),
            },
          }
        : undefined,
      extraDetails: boatInfo.extraDetails?.length
        ? JSON.stringify(boatInfo.extraDetails)
        : undefined,
    };
  }

  validateImageLimit(filesCount: number, planLimit: number) {
    if (filesCount > planLimit) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        `You have exceeded the image upload limit (${planLimit} allowed)`,
      );
    }
    this.logger.log(`Total uploaded images: ${filesCount} (limit: ${planLimit})`);
  }

  async syncBoatsEngines(
    listingId: string,
    existingEngines: UpdateBoatEngineDto[],
    updatedEngines: UpdateBoatEngineDto[],
  ) {
    const previousIds = existingEngines.map((e) => e.id).filter(Boolean);
    const updatedIds = updatedEngines.map((e) => e.id).filter(Boolean);
    const enginesToDelete = previousIds.filter((id) => !updatedIds.includes(id));

    await this.prisma.client.$transaction(async (tx) => {
      if (enginesToDelete.length > 0) {
        await tx.boatEngine.deleteMany({
          where: { boatId: listingId, id: { in: enginesToDelete } },
        });
        this.logger.log(`Deleted ${enginesToDelete.length} engines`);
      }

      const enginesToUpdate = updatedEngines.filter((e) => e.id);
      for (const updated of enginesToUpdate) {
        const existing = existingEngines.find((e) => e.id === updated.id);
        if (!existing) {
          throw new AppError(
            HttpStatus.BAD_REQUEST,
            `Invalid engine ID: ${updated.id}. It does not belong to this boat.`,
          );
        }
        await tx.boatEngine.update({
          where: { id: updated.id },
          data: {
            hours: updated.hours ?? existing.hours,
            horsepower: updated.horsepower ?? existing.horsepower,
            make: updated.make ?? existing.make,
            model: updated.model ?? existing.model,
            fuelType: updated.fuelType ?? existing.fuelType,
            propellerType: updated.propellerType ?? existing.propellerType,
          },
        });
      }

      const enginesToCreate = updatedEngines.filter((e) => !e.id);
      if (enginesToCreate.length > 0) {
        await tx.boatEngine.createMany({
          data: enginesToCreate.map((e) => ({
            boatId: listingId,
            hours: e.hours ?? 0,
            horsepower: e.horsepower ?? 0,
            make: e.make ?? '',
            model: e.model ?? '',
            fuelType: e.fuelType ?? '',
            propellerType: e.propellerType ?? '',
          })),
        });
        this.logger.log(`Created ${enginesToCreate.length} engines`);
      }
    });
  }

  // No-op: image processing handled synchronously or skipped (no Redis/queue)
  async emitAllBoatEvents(
    _userId: string,
    _listingId: string,
    _boatInfo: CreateBoatsInfoDto | UpdateListingDtoWithImagesDto,
    _files: QueueFile[],
  ): Promise<void> {
    this.logger.log('Queue disabled — skipping async image/spec events');
  }

  async emitBoatImageDeleteEvent(
    _userId: string,
    _listingId: string,
    _imagesToDelete: string[],
  ): Promise<void> {
    this.logger.log('Queue disabled — skipping image delete event');
  }
}
