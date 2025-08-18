import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { EmployeesService } from 'src/employees/employees.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { WsGateway } from 'src/ws/ws.gateway';

dayjs.extend(utc);
dayjs.extend(timezone);
@Injectable()
export class NodeRedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly employeeService: EmployeesService,
    private readonly wsGateway: WsGateway,
  ) {}
  async logAttendanceNodRed(createAttendanceDto: CreateAttendanceDto) {
    if (!createAttendanceDto.rfid_code) {
      throw new Error('RFID code is required');
    }
    const employee = await this.employeeService.findOne(
      createAttendanceDto.rfid_code,
    );

    if (!employee) {
      throw new Error('employee not found');
    }
    const now = new Date();
    const startOfDay = dayjs(now)
      .tz('Asia/Jakarta')
      .startOf('day')
      .tz('UTC')
      .toDate();
    const endOfDay = dayjs(now)
      .tz('Asia/Jakarta')
      .endOf('day')
      .tz('UTC')
      .toDate();

    let attendance = await this.prisma.attendance.findFirst({
      where: {
        employee_id: employee.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
    if (!attendance) {
      attendance = await this.prisma.attendance.create({
        data: {
          employee_id: employee.id,
          date: new Date(),
          time_in: now,
          total_hours: 0,
        },
      });
    }

    const lastScan = await this.prisma.scanLog.findFirst({
      where: {
        employee_id: employee.id,
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { timestamp: 'desc' },
    });
    let status = 'in';
    if (lastScan) {
      status = lastScan.scan_type === 'in' ? 'out' : 'in';
    }
    await this.prisma.scanLog.create({
      data: {
        employee_id: employee.id,
        attendance_id: attendance.id,
        timestamp: now,
        scan_type: status,
        source: 'node-red',
      },
    });
    if (status === 'in' && !attendance.time_in) {
      await this.prisma.attendance.update({
        where: { id: attendance.id },
        data: { time_in: now },
      });
      return { message: 'Scan masuk dicatat' };
    }
    if (status === 'out' && attendance.time_in) {
      const lastScanIn = await this.prisma.scanLog.findFirst({
        where: {
          employee_id: employee.id,
          attendance_id: attendance.id,
          scan_type: 'in',
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
      if (lastScanIn) {
        const lastTimeIn = lastScanIn.timestamp;
        const duration = now.getTime() - lastTimeIn.getTime();
        const durationHours = +(duration / 1000 / 60 / 60).toFixed(2);
        const currentTotal = attendance.total_hours ?? 0;
        const newTotalHours = +(currentTotal + durationHours).toFixed(2);
        await this.prisma.attendance.update({
          where: { id: attendance.id },
          data: {
            time_out: now,
            total_hours: newTotalHours,
          },
        });
      }
    }
    console.log(attendance, employee);
    const data = {
      employee_name: employee.name,
      status: status,
      time: now,
    };
    this.wsGateway.sendUpdateLogNotification(data);
    return { message: 'scan di catat' };
  }
}
