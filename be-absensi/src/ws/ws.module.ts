import { Module } from '@nestjs/common';
import { WsGateway } from './ws.gateway';
import { WsController } from './ws.controller';

@Module({
  providers: [WsGateway],
  controllers: [WsController],
  exports: [WsGateway],
})
export class WsModule {}
