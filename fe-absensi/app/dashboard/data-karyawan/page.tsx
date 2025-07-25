"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { AddEmployeeModal } from "@/components/AddEmployeeModal";
import { useEffect, useState } from "react";
import { getAllEmployees, deleteEmployee } from "@/lib/api/employees";
import { ModalDeleteConfirmation } from "@/components/ModalDeleteConfirmation";
import { toast } from "sonner";
import { EditEmployeeModal } from "@/components/EditEmployeeModal";
type Employee = {
  id: number;
  rfid_code: string;
  nik: string;
  name: string;
  position: string;
  department: string;
  createdAt: string;
};

export default function DataKaryawanPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number>(0);

  const handleGetAllEmployees = async () => {
    try {
      const res = await getAllEmployees();
      setEmployees(res);
      console.log(res);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Terjadi kesalahan saat menghapus data.");
    }
  };
  const handleDelete = async () => {
    console.log("Item dihapus", selectedId);
    setOpen(false);
    try {
      const res = await deleteEmployee(selectedId);
      handleGetAllEmployees();
      toast.success("berhasil hapus karyawan");
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    handleGetAllEmployees();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Card className="overflow-x-auto">
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle>Data Karyawan</CardTitle>
            <AddEmployeeModal onSuccess={handleGetAllEmployees} />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-sm border rounded overflow-hidden">
            <thead>
              <tr className="bg-muted text-left">
                <th className="p-2 border-b">RFID</th>
                <th className="p-2 border-b">NIk</th>
                <th className="p-2 border-b">Nama</th>
                <th className="p-2 border-b">Jabatan</th>
                <th className="p-2 border-b">Bagian</th>

                <th className="p-2 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((item, index) => (
                <tr key={index} className="hover:bg-muted/30">
                  <td className="p-2 border-b">{item.rfid_code}</td>
                  <td className="p-2 border-b">{item.nik}</td>
                  <td className="p-2 border-b">{item.name}</td>
                  <td className="p-2 border-b">{item.position}</td>
                  <td className="p-2 border-b">{item.department}</td>
                  <td className="p-2 border-b text-center space-x-2">
                    <EditEmployeeModal
                      rfid_code={item.rfid_code}
                      onSuccess={handleGetAllEmployees}
                      employeeId={item.id}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        setSelectedId(item.id);
                        setOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center p-4 text-muted-foreground"
                  >
                    Tidak ada data karyawan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <ModalDeleteConfirmation
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
