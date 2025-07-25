"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  updateEmployee,
  getEmployeeById,
  UpdateEmployeePayload,
} from "@/lib/api/employees";
import { Pencil } from "lucide-react";

type MyModalProps = {
  employeeId: number;
  onSuccess: () => void;
  rfid_code: string;
};

export function EditEmployeeModal({
  employeeId,
  onSuccess,
  rfid_code,
}: MyModalProps) {
  console.log("RFID Input mounted");
  const [form, setForm] = useState({
    rfid_code: "",
    nik: "",
    name: "",
    position: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false); // ← tambahkan ini

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGetEmployeeById = async (id: string) => {
    try {
      const res = await getEmployeeById(id);
      setForm({
        rfid_code: res.rfid_code || "",
        nik: res.nik || "",
        name: res.name || "",
        position: res.position || "",
        department: res.department || "",
      });
    } catch (err: any) {
      toast.error(err.message || "Gagal mengambil data karyawan");
    }
  };

  // ⏰ Trigger fetch saat modal dibuka
  useEffect(() => {
    if (open) {
      handleGetEmployeeById(rfid_code);
    }
  }, [open, employeeId]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: UpdateEmployeePayload = { ...form };
      await updateEmployee(employeeId, payload);

      toast.success("Karyawan berhasil diperbarui!");
      onSuccess();

      setForm({
        rfid_code: "",
        nik: "",
        name: "",
        position: "",
        department: "",
      });

      setOpen(false); // Tutup modal secara manual
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat mengupdate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Karyawan</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {[
            { label: "RFID Code", name: "rfid_code" },
            { label: "NIK", name: "nik" },
            { label: "Nama Lengkap", name: "name" },
            { label: "Jabatan", name: "position" },
            { label: "Departemen", name: "department" },
          ].map((field) => (
            <div key={field.name} className="grid gap-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                name={field.name}
                value={(form as any)[field.name]}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
