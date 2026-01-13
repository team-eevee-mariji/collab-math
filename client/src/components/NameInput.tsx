// src/components/NameInput.tsx
import type { InputHTMLAttributes } from "react";

type NameInputProps = {
  value: string;
  onChange: (next: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

export default function NameInput({ value, onChange, ...inputProps }: NameInputProps) {
  return (
    <input
      className="name-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...inputProps}
    />
  );
}
