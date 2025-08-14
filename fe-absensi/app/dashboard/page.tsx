"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getAllAttendance } from "@/lib/api/attendance";
import { exportToExcel } from "@/utils/exportToExcel";
import {
  getDailyAttendance,
  getWeeklyAttendance,
  getMonthlyAttendance,
} from "@/lib/api/attendance";
import { formatToJakartaTime, formatToJakartaDate } from "@/utils/formatTimes";
import socket from "@/lib/socket";
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

export default function AbsensiPage() {
  const [filter, setFilter] = useState<"harian" | "mingguan" | "bulanan">(
    "harian"
  );
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    // === Listener koneksi ===
    const handleConnect = () => {
      console.log("connected");
      setIsConnected(true);
    };
    const handleDisconnect = () => {
      console.log("disconnected");
      setIsConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // === Listener event log_update dari backend ===
    const onLogUpdate = async () => {
      console.log("log_update");
      await handleGetAttendance(filter); // Pastikan filter disimpan atau pakai useRef
    };
    socket.on("updateLogNotification", onLogUpdate);
    socket.connect();
    return () => {
      socket.off("updateLogNotification", onLogUpdate);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect(); // optional kalau socket hanya untuk page ini
    };
  }, []);
  const getAttendanceByFilter = async (
    filter: "harian" | "mingguan" | "bulanan"
  ) => {
    switch (filter) {
      case "harian":
        return await getDailyAttendance();
      case "mingguan":
        return await getWeeklyAttendance();
      case "bulanan":
        return await getMonthlyAttendance();
      default:
        return await getAllAttendance();
    }
  };

  const handleGetAttendance = async (
    filter: "harian" | "mingguan" | "bulanan"
  ) => {
    try {
      const res = await getAttendanceByFilter(filter); // API baru berdasarkan filter
      setAttendance(res);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleGetAttendance(filter);
  }, [filter]);

  return (
    <>
      <div className="flex px-6 ">
        <div className="flex flex-wrap mt-5 gap-5 items-center justify-between w-full  mb-4">
          <div className="flex items-center">
            <Image
              src="/logo-khalil.png"
              alt="Logo Khalil"
              width={100}
              height={100}
              className="w-16 h-16 rounded-full"
            />
            <h1 className="text-2xl font-bold">Data Absensi</h1>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />

            <span className="text-sm">
              {isConnected ? "Online" : "Offline"}
            </span>
          </div>

          <div className="flex items-center gap-2 ">
            <Button onClick={() => exportToExcel(attendance)}>
              Export to exel
            </Button>
            <Label>Pilih Filter:</Label>
            <Select
              value={filter}
              onValueChange={(val) => setFilter(val as any)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="harian">Harian</SelectItem>
                <SelectItem value="mingguan">Mingguan</SelectItem>
                <SelectItem value="bulanan">Bulanan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="p-6">
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RFID</TableHead>
                <TableHead>NIk</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Bagian</TableHead>
                <TableHead>Jam in</TableHead>
                <TableHead>Jam out</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jam kerja</TableHead>
                <TableHead>History in</TableHead>
                <TableHead>History out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.length > 0 ? (
                attendance.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.employee?.rfid_code}</TableCell>
                    <TableCell>{item.employee?.nik}</TableCell>
                    <TableCell>{item.employee?.name}</TableCell>
                    <TableCell>{item.employee?.position}</TableCell>
                    <TableCell>{item.employee?.department}</TableCell>
                    <TableCell>
                      {item.time_in ? formatToJakartaTime(item.time_in) : "-"}
                    </TableCell>
                    <TableCell>
                      {item.time_out ? formatToJakartaTime(item.time_out) : "-"}
                    </TableCell>
                    <TableCell>
                      {item.date ? formatToJakartaDate(item.date) : "-"}
                    </TableCell>
                    <TableCell>{item.total_hours} Jam</TableCell>
                    <TableCell>
                      <ul className="list-disc pl-4 space-y-1">
                        {item?.scan_logs
                          ?.filter((log) => log.scan_type === "in")
                          .map((log, i) => (
                            <li
                              key={i}
                              className="flex items-center justify-between gap-2"
                            >
                              <span>
                                {log.timestamp
                                  ? formatToJakartaTime(log.timestamp)
                                  : "-"}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </TableCell>

                    <TableCell>
                      <ul className="list-disc pl-4 space-y-1">
                        {item?.scan_logs
                          ?.filter((log) => log.scan_type === "out")
                          .map((log, i) => (
                            <li
                              key={i}
                              className="flex items-center justify-between gap-2"
                            >
                              <span>
                                {log.timestamp
                                  ? formatToJakartaTime(log.timestamp)
                                  : "-"}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center text-muted-foreground"
                  >
                    Tidak ada data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: "hadir" | "telat" | "pulang" }) {
  const colorMap = {
    hadir: "bg-green-500",
    telat: "bg-yellow-500",
    pulang: "bg-gray-500",
  };
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-white text-sm ${colorMap[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}
