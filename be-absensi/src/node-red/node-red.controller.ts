import { Controller, Post, Body } from '@nestjs/common';
import { NodeRedService } from './node-red.service';

import { CreateAttendanceDto } from './dto/create-attendance.dto';
@Controller('node-red')
export class NodeRedController {
  constructor(private readonly nodeRedService: NodeRedService) {}
  @Post('record')
  recordAttendance(@Body() dto: CreateAttendanceDto) {
    return this.nodeRedService.logAttendanceNodRed(dto);
  }
}
