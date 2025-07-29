import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { WsGateway } from '../ws/ws.gateway';

dayjs.extend(utc);
dayjs.extend(timezone);

const JAKARTA = 'Asia/Jakarta';

@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    private readonly wsGateway: WsGateway,
  ) {}

  async findAll() {
    return this.prisma.attendance.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        employee: true,
        scan_logs: true,
      },
    });
  }
  async findDaily() {
    const now = dayjs().tz(JAKARTA);
    const startOfDay = now.startOf('day').toDate();
    const endOfDay = now.endOf('day').toDate();

    return this.prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        employee: true,
        scan_logs: true,
      },
    });
  }
  async findWeekly() {
    const now = dayjs().tz(JAKARTA);
    const startOfWeek = now.startOf('week').toDate(); // mulai dari Minggu
    const endOfWeek = now.endOf('week').toDate(); // Sabtu malam

    return this.prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        employee: true,
        scan_logs: true,
      },
    });
  }
  async findMonthly() {
    const now = dayjs().tz(JAKARTA);
    const startOfMonth = now.startOf('month').toDate();
    const endOfMonth = now.endOf('month').toDate();

    return this.prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        employee: true,
        scan_logs: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.attendance.findUnique({
      where: { id: id },
    });
  }
  async logAttendance(createAttendanceDto: CreateAttendanceDto) {
    const now = new Date();
    // BIARKAN tetap asli

    const startOfDay = dayjs(now)
      .tz('Asia/Jakarta')
      .startOf('day')
      .tz('UTC', true)
      .toDate();

    const endOfDay = dayjs(now)
      .tz('Asia/Jakarta')
      .endOf('day')
      .tz('UTC', true)
      .toDate();

    const { employee_id, status } = createAttendanceDto;

    // 1. Simpan ke ScanLog dulu

    // 2. Cek absensi hari ini
    let attendance = await this.prisma.attendance.findFirst({
      where: {
        employee_id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!attendance) {
      // Kalau belum ada, bikin baru
      attendance = await this.prisma.attendance.create({
        data: {
          employee_id,
          date: new Date(),
          time_in: status === 'in' ? now : undefined,
          total_hours: 0,
        },
      });
    }
    console.log('SCAN TYPE:', status);
    await this.prisma.scanLog.create({
      data: {
        employee_id,
        attendance_id: attendance.id,
        timestamp: now,
        scan_type: status,
        source: 'manual',
      },
    });
    this.wsGateway.sendUpdateLogNotification('refresh');
    // 3. Kalau statusnya "in", update time_in kalau belum ada
    if (status === 'in' && !attendance.time_in) {
      await this.prisma.attendance.update({
        where: { id: attendance.id },
        data: { time_in: now },
      });

      return { message: 'Scan masuk dicatat' };
    }

    // 4. Kalau statusnya "out", hitung durasi dan tambahkan
    if (status === 'out' && attendance.time_in) {
      const lastScanIn = await this.prisma.scanLog.findFirst({
        where: {
          employee_id,
          attendance_id: attendance.id,
          scan_type: 'in',
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
      if (lastScanIn) {
        const lastTimeIn = lastScanIn.timestamp;
        const durationMs = now.getTime() - lastTimeIn.getTime();
        const durationHours = +(durationMs / 1000 / 60 / 60).toFixed(2);
        const currentTotal = attendance.total_hours ?? 0;
        const newTotalHours = +(currentTotal + durationHours).toFixed(2);
        console.log('Start of Day:', newTotalHours);
        console.log('End of Day:', newTotalHours);
        await this.prisma.attendance.update({
          where: { id: attendance.id },
          data: {
            time_out: now,
            total_hours: newTotalHours,
            // optionally reset time_in kalau kamu anggap sesi sudah selesai
            // time_in: null,
          },
        });

        return {
          message: `Scan keluar dicatat, total jam sekarang ${newTotalHours}`,
        };
      }
    }

    return { message: 'Scan dicatat, tidak ada perubahan jam kerja' };
  }
}
