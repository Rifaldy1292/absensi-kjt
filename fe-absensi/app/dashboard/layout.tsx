"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading, setLoading } = useAppStore();
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      router.replace("/");
    } else {
      setLoading(false);
    }
  }, []);
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
