import { PermissionEnum } from '@/common/enum/permission.enum';
import { RequirePermission } from '@/common/jwt/jwt.decorator';
import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as multer from 'multer';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './services/settings.service';

@ApiTags('Admin -- Settings')
@Controller('admin/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @RequirePermission(PermissionEnum.SETTINGS_VIEW)
  @ApiOperation({ summary: 'Get site settings' })
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  @RequirePermission(PermissionEnum.SETTINGS_UPDATE)
  @ApiOperation({ summary: 'Update site settings' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo', { storage: multer.memoryStorage() }))
  updateSettings(
    @Body() dto: UpdateSettingsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.settingsService.updateSettings(dto, file);
  }
}
