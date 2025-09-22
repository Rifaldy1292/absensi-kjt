"use client";

import { useState } from "react";
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
import { toast } from "sonner"; // buat notifikasi manis
import { createEmployee, CreateEmployeePayload } from "@/lib/api/employees";
import { useRef } from "react";
type MyModalProps = {
  onSuccess: () => void;
};

export function AddEmployeeModal({ onSuccess }: MyModalProps) {
  const [form, setForm] = useState({
    rfid_code: "",
    nik: "",
    name: "",
    position: "",
    department: "",
    salary: "",
  });

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: CreateEmployeePayload = {
        rfid_code: form.rfid_code,
        nik: form.nik,
        name: form.name,
        position: form.position,
        department: form.department,
        salary: Number(form.salary),
      };

      await createEmployee(payload);

      toast.success("Karyawan berhasil ditambahkan!");
      onSuccess();
      setForm({
        rfid_code: "",
        nik: "",
        name: "",
        position: "",
        department: "",
        salary: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menambahkan");
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">+ Tambah Karyawan</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Karyawan</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {[
            { label: "RFID Code", name: "rfid_code" },
            { label: "NIK", name: "nik" },
            { label: "Nama Lengkap", name: "name" },
            { label: "Jabatan", name: "position" },
            { label: "Departemen", name: "department" },
            { label: "Gaji (Rp)", name: "salary", type: "number" }, // ✅ tambah ini
          ].map((field, index) => (
            <div key={field.name} className="grid gap-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                name={field.name}
                type={field.type || "text"} // default "text"
                value={(form as any)[field.name]}
                onChange={handleChange}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    inputRefs.current[index + 1]?.focus();
                  }
                }}
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
