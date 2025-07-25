// components/GlobalLoading.tsx
"use client";
import { useAppStore } from "@/stores/useAppStore";

export default function Loading() {
  const isLoading = useAppStore((state) => state.isLoading);
  return isLoading ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
    </div>
  ) : null;
}
