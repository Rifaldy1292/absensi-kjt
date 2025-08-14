"use client";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createAttendance } from "@/lib/api/attendance";
import { formatToJakartaTime, formatToJakartaDate } from "@/utils/formatTimes";
import socket from "@/lib/socket";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
type AbcentPerson = {
  employee_name: string;
  status: string;
  time: Date;
};
export default function DashboardPage() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mode, setMode] = useState<"waiting" | "showing">("waiting");
  const masukSound = "/sound-masuk.wav";
  const keluarSound = "/sound-keluar.wav";
  const [soundEnabled, setSoundEnabled] = useState(false);
  const masukRef = useRef<HTMLAudioElement | null>(null);
  const keluarRef = useRef<HTMLAudioElement | null>(null);
  const soundEnabledRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const [abcentPerson, setAbcentPerson] = useState<AbcentPerson>({
    employee_name: "",
    status: "",
    time: new Date(),
  });
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);
  useEffect(() => {
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

    const onLogUpdate = (data: AbcentPerson) => {
      console.log(data);
      if (soundEnabledRef.current) {
        if (data.status === "in") playSafe(masukSound);
        else if (data.status === "out") playSafe(keluarSound);
      }

      setMode("showing");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setAbcentPerson({
          employee_name: "",
          status: "",
          time: new Date(0),
        });

        setMode("waiting");
      }, 5000);
      setAbcentPerson(data);
    };
    socket.on("updateLogNotification", onLogUpdate);
    socket.connect();
    return () => {
      socket.off("updateLogNotification", onLogUpdate);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    masukRef.current = new Audio(masukSound);
    keluarRef.current = new Audio(keluarSound);
    masukRef.current.preload = "auto";
    keluarRef.current.preload = "auto";
    masukRef.current.volume = 1;
    keluarRef.current.volume = 1;
    if (localStorage.getItem("soundEnabled") === "1") {
      console.log("sound enabled");
      (async () => {
        try {
          masukRef.current!.muted = true;
          await masukRef.current!.play();
          masukRef.current!.pause();
          masukRef.current!.currentTime = 0;
          masukRef.current!.muted = false;
          setSoundEnabled(true);
          console.log("sound enabled2");
        } catch (error) {
          setSoundEnabled(false);
          console.log("gagal sound enabled2", error);
        }
      })();
    }
  }, []);
  const playSafe = async (src: string) => {
    try {
      const audio = new Audio(src);
      audio.volume = 1;
      await audio.play();
      console.log("✅ Played:", src);
    } catch (error) {
      console.error("❌ play failed:", src, error);
    }
  };
  return (
    <div>
      <div
        className="flex
      justify-end p-5"
      >
        <div className="flex items-center space-x-2 gap-5">
          Off{" "}
          <Switch
            id="enable-sound"
            checked={soundEnabled}
            onCheckedChange={async (val) => {
              if (val) {
                try {
                  await masukRef.current?.play();
                  masukRef.current?.pause();
                  if (masukRef.current) masukRef.current.currentTime = 0;

                  await keluarRef.current?.play();
                  keluarRef.current?.pause();
                  if (keluarRef.current) keluarRef.current.currentTime = 0;

                  localStorage.setItem("soundEnabled", "1");
                  setSoundEnabled(true);
                } catch (e) {
                  console.error("Enable sound failed:", e);
                  setSoundEnabled(false);
                }
              } else {
                localStorage.removeItem("soundEnabled");
                setSoundEnabled(false);
              }
            }}
          />
          On
          <Label htmlFor="enable-sound">Aktifkan Suara</Label>
        </div>
      </div>
      <div className="flex p-3 items-center w-full justify-center min-h-screen bg-muted/50 relative">
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
            <CardContent className="grid grid-cols-1 sm:grid-cols-1 ">
              <div className="space-y-2 relative border p-2 rounded">
                <Avatar className="w-16 h-16 mx-auto">
                  <AvatarImage
                    alt={abcentPerson.employee_name}
                    src="/logo-khalil.png"
                  />
                </Avatar>

                <p className="text-sm font-semibold">
                  {abcentPerson.employee_name}
                </p>
                <p className="text-sm font-semibold">
                  {new Date().toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground"></p>
                <StatusBadge status={abcentPerson.status} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = status === "in" ? "bg-green-400" : "bg-red-400";
  return (
    <span
      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-white text-xs ${color} break-words max-w-[100px]`}
    >
      {status}
    </span>
  );
}
