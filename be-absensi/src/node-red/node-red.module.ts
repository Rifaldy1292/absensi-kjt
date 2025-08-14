import { Module } from '@nestjs/common';
import { NodeRedService } from './node-red.service';
import { NodeRedController } from './node-red.controller';
import { EmployeesModule } from 'src/employees/employees.module';
import { WsGateway } from 'src/ws/ws.gateway';
@Module({
  imports: [EmployeesModule],
  controllers: [NodeRedController],
  providers: [NodeRedService, WsGateway],
})
export class NodeRedModule {}
