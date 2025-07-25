// lib/scanLogs.ts
import axios from "axios";

export type ScanLogData = {
  nama: string;
  waktu: string;
  status: "in | out";
};

export function sendScanLog(data: ScanLogData) {
  return axios.post("/api/log-display-clear", data);
}
