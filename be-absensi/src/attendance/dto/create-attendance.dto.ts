// src/attendance/dto/create-attendance.dto.ts

export class CreateAttendanceDto {
  employee_id: number;
  status: 'in' | 'out';
}
