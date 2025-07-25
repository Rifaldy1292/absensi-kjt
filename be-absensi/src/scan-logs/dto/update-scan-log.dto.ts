import { PartialType } from '@nestjs/mapped-types';
import { CreateScanLogDto } from './create-scan-log.dto';

export class UpdateScanLogDto extends PartialType(CreateScanLogDto) {}
