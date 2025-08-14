import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeesModule } from './employees/employees.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ScanLogsModule } from './scan-logs/scan-logs.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

import { WsModule } from './ws/ws.module';
import { NodeRedModule } from './node-red/node-red.module';
@Module({
  imports: [
    PrismaModule,
    EmployeesModule,
    AttendanceModule,
    ScanLogsModule,
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true, // biar bisa dipakai di mana saja tanpa impor ulang
    }),

    WsModule,

    NodeRedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
