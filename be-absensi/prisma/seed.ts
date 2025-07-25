import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Admin
  await prisma.user.create({
    data: {
      name: 'Admin Utama',
      email: 'admin@example.com',
      password: 'hashed-password', // Ganti dengan bcrypt hash
      role: 'admin',
    },
  });

  // Employees
  await prisma.employee.createMany({
    data: [
      {
        rfid_code: '123456',
        nik: 'NIK001',
        name: 'Employee 1',
        position: 'Engineer',
        department: 'Operations',
      },
      {
        rfid_code: '112233',
        nik: 'NIK002',
        name: 'Employee 2',
        position: 'Staff',
        department: 'IT',
      },
      {
        rfid_code: '33211',
        nik: 'NIK003',
        name: 'Employee 3',
        position: 'Technician',
        department: 'HR',
      },
      {
        rfid_code: '223311',
        nik: 'NIK004',
        name: 'Employee 4',
        position: 'Manager',
        department: 'IT',
      },
      {
        rfid_code: '112311',
        nik: 'NIK005',
        name: 'Employee 5',
        position: 'Engineer',
        department: 'Maintenance',
      },
      {
        rfid_code: '212311',
        nik: 'NIK006',
        name: 'Employee 6',
        position: 'Staff',
        department: 'Operations',
      },
      {
        rfid_code: '112319',
        nik: 'NIK007',
        name: 'Employee 7',
        position: 'Technician',
        department: 'IT',
      },
      {
        rfid_code: '112317',
        nik: 'NIK008',
        name: 'Employee 8',
        position: 'Manager',
        department: 'HR',
      },
      {
        rfid_code: '112390',
        nik: 'NIK009',
        name: 'Employee 9',
        position: 'Engineer',
        department: 'IT',
      },
      {
        rfid_code: '112323',
        nik: 'NIK010',
        name: 'Employee 10',
        position: 'Staff',
        department: 'Maintenance',
      },
    ],
  });

  // Attendance + ScanLog
  const startDate = new Date('2025-07-01');

  for (let emp_id = 1; emp_id <= 10; emp_id++) {
    for (let d = 0; d < 5; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + d);

      const timeIn = new Date(date);
      timeIn.setHours(7, Math.floor(Math.random() * 30));

      const timeOut = new Date(timeIn);
      timeOut.setHours(
        timeIn.getHours() + 8,
        timeIn.getMinutes() + Math.floor(Math.random() * 30),
      );

      const totalHours = Math.round(
        (timeOut.getTime() - timeIn.getTime()) / 3600000,
      ); // hasil dalam jam bulat (Int)

      const attendance = await prisma.attendance.create({
        data: {
          employee_id: emp_id,
          date,
          time_in: timeIn,
          time_out: timeOut,
          total_hours: totalHours,
        },
      });

      await prisma.scanLog.createMany({
        data: [
          {
            employee_id: emp_id,
            attendance_id: attendance.id,
            timestamp: timeIn,
            scan_type: 'in',
            source: 'Gate A',
          },
          {
            employee_id: emp_id,
            attendance_id: attendance.id,
            timestamp: timeOut,
            scan_type: 'out',
            source: 'Gate A',
          },
        ],
      });
    }
  }

  console.log('✅ Dummy data berhasil dimasukkan!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Gagal insert dummy:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
