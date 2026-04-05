import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin -- Boats')
@Controller('admin/boats')
export class BoatsController {}
