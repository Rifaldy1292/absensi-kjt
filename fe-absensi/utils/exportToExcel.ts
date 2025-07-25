// utils/exportToExcel.ts
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { formatToJakartaFullDateTime } from "@/utils/formatTimes";
type Employee = {
  id: number;
  rfid_code: string;
  nik: string;
  name: string;
  position: string;
  department: string;
  createdAt: string;
};
type ScanLog = {
  id: number;
  employee_id: number;
  attendance_id: number;
  timestamp: string;
  scan_type: "in" | "out";
};

type Attendance = {
  id: number;
  employee_id: number;
  date: string;
  time_in: string | null;
  time_out: string | null;
  total_hours: string | null;
  createdAt: string;
  employee: Employee;
  scan_logs: ScanLog[];
};
export function exportToExcel(data: Attendance[]) {
  const exportData = data.map((item) => ({
    RFID: item.employee.rfid_code,
    NIK: item.employee.nik,
    Nama: item.employee.name,
    Jabatan: item.employee.position,
    Bagian: item.employee.department,
    "Jam Masuk": formatToJakartaFullDateTime(item.time_in),
    "Jam Pulang": formatToJakartaFullDateTime(item.time_out),
    Tanggal: formatToJakartaFullDateTime(item.date),
    "Total Jam": item.total_hours ?? "-",
    "Log Scan": item.scan_logs
      .map(
        (log) =>
          `${log.scan_type.toUpperCase()} @ ${formatToJakartaFullDateTime(
            log.timestamp
          )}`
      )
      .join(", "),
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Absensi");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const filename = `absensi_${new Date().toISOString().split("T")[0]}.xlsx`;
  saveAs(blob, filename);
}
