// components/HiddenRFIDInput.tsx
import { useEffect, useRef } from "react";

interface Props {
  onScan: (tag: string) => void;
}

export default function HiddenRFIDInput({ onScan }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focus = () => inputRef.current?.focus();
    focus();

    const input = inputRef.current;
    input?.addEventListener("blur", focus);

    return () => input?.removeEventListener("blur", focus);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const tag = e.currentTarget.value;
      e.preventDefault();
      if (tag) {
        onScan(tag);
      }
      e.currentTarget.value = "";
    }
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const tag = inputRef.current?.value;
        if (tag) onScan(tag);
        if (inputRef.current) inputRef.current.value = "";
      }}
    >
      <input
        ref={inputRef}
        onKeyDown={handleKeyDown}
        className="bg-amber-500 text-black px-2 py-1"
        inputMode="none"
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          opacity: 1,
          zIndex: 9999,
          pointerEvents: "auto",
        }}
      />
    </form>
  );
}
