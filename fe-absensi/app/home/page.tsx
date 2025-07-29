"use client";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createAttendance } from "@/lib/api/attendance";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import HiddenRFIDInput from "@/components/InputRfidHidden";
import { getEmployeeById } from "@/lib/api/employees";
type AbsensiData = {
  id: number;
  name: string;
  nik: string;
  position: string;
  department: string;
  rfid_code: number;
  createdAt: string;
};

export default function DashboardPage() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mode, setMode] = useState<"waiting" | "showing">("waiting");
  const [users, setUsers] = useState<AbsensiData[]>([]);
  const beepSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    beepSound.current = new Audio("/beep-329314.mp3");
  }, []);

  const handleScan = async (rfid: string) => {
    console.log("Tag dari _app:", rfid);
    try {
      const res = await getEmployeeById(rfid);
      console.log("Data karyawan:", res);
      if (res) {
        setUsers((prev) => {
          // Cegah penambahan kalau sudah ada satu orang
          if (prev.length > 0) return prev;

          return [res]; // Tambah hanya jika kosong
        });
        setMode("showing");
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // ⏳ Set timer untuk reset state
        timeoutRef.current = setTimeout(() => {
          setUsers([]);
          setMode("waiting");
        }, 10000);
      }
    } catch (error) {
      console.error("Gagal ambil data karyawan:", error);
    }
  };

  const handleBulkAttendance = async (status: "in" | "out") => {
    for (const user of users) {
      try {
        await createAttendance({
          employee_id: user.id,
          status,
        });

        console.log(`Absensi sukses untuk ${user.name}`);

        toast.success(
          <div>
            <p className="font-semibold">Absensi sukses</p>
            <p className="text-sm text-muted-foreground">
              Berhasil absen untuk {user.name}
            </p>
          </div>
        );
      } catch (error) {
        console.error(`Gagal absen ${user.name}`, error);

        toast.error(
          <div>
            <p className="font-semibold">Gagal absen</p>
            <p className="text-sm text-muted-foreground">
              Terjadi kesalahan saat absen {user.name}
            </p>
          </div>
        );
      }
    }

    // Setelah selesai semua
    setUsers([]);
    setMode("waiting");
  };
  return (
    <div className="flex p-3 items-center w-full justify-center min-h-screen bg-muted/50 relative">
      <HiddenRFIDInput onScan={handleScan} />
      {mode === "waiting" ? (
        <Card className="p-10 mx-auto text-center h-[500px] animate-pulse">
          <CardHeader>
            <CardTitle className="text-xl">Menunggu Tap Kartu...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Silakan tap kartu di alat untuk absensi
            </p>
            <div className="mt-6 text-4xl">📡</div>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-6 w-full max-w-2xl text-center space-y-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-red-500 text-white">Absen Pulang</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Absen Pulang</AlertDialogTitle>
                <AlertDialogDescription>
                  Yakin ingin absen pulang? Data akan langsung dikirim.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleBulkAttendance("out")}>
                  Ya, Absen Pulang
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <CardContent className="grid grid-cols-1 sm:grid-cols-1 ">
            {users.map((user, idx) => (
              <div key={idx} className="space-y-2 relative border p-2 rounded">
                <button
                  onClick={() =>
                    setUsers((prev) =>
                      prev.filter((u) => u.rfid_code !== user.rfid_code)
                    )
                  }
                  className="absolute top-1 right-1 text-red-500 hover:text-red-700 text-sm"
                >
                  ❌
                </button>

                <Avatar className="w-16 h-16 mx-auto">
                  <AvatarImage alt={user.name} />
                  <AvatarFallback>{user.nik.charAt(0)}</AvatarFallback>
                </Avatar>

                <p className="text-sm font-semibold">{user.name}</p>

                <p className="text-sm font-semibold">
                  {new Date().toLocaleString()}
                </p>

                <p className="text-xs text-muted-foreground"></p>

                <StatusBadge status={user.rfid_code} />
              </div>
            ))}
          </CardContent>

          {/* 🟢 AlertDialog Absen Masuk */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-green-500 text-white">Absen Masuk</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Absen Masuk</AlertDialogTitle>
                <AlertDialogDescription>
                  Yakin ingin absen masuk? Data akan langsung dikirim.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleBulkAttendance("in")}>
                  Ya, Absen Masuk
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      )}
      {/* Tombol Tes Manual
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => simulateTyping("123456789")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow"
        >
          Tes Scan Manual
        </button>

        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow">
          Tes Scan 4 Orang
        </button>
      </div> */}
    </div>
  );
}

function StatusBadge({ status }: { status: number }) {
  return (
    <span
      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-white text-xs bg-green-400 break-words max-w-[100px]`}
    >
      {status}
    </span>
  );
}
