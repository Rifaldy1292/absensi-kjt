import { Controller, Post, Body } from '@nestjs/common';
import { WsGateway } from './ws.gateway';

@Controller('ws-test')
export class WsController {
  constructor(private readonly wsGateway: WsGateway) {}

  @Post('send')
  sendTest(@Body() body: any) {
    this.wsGateway.sendRfidData(body.rfid);
    return { message: 'Test sent', data: body.rfid };
  }
}
