import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
// import dayjs from 'dayjs';
// import utc from 'dayjs/plugin/utc';
// import timezone from 'dayjs/plugin/timezone';

// dayjs.extend(utc);
// dayjs.extend(timezone);
@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

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
    const now = new Date(); // waktu saat ini, misalnya 14:30 WIB

    const startOfDay = new Date(now); // clone, jadi ini salinan
    startOfDay.setHours(0, 0, 0, 0); // jadi: 00:00:00

    const endOfDay = new Date(now); // clone lagi
    endOfDay.setHours(23, 59, 59, 999); // jadi: 23:59:59
    999;

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
    const now = new Date();
    const first = now.getDate() - now.getDay();
    const startOfWeek = new Date(now.setDate(first));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

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
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

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
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

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
