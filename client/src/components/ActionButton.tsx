// src/components/ActionButton.tsx
import type { ButtonHTMLAttributes } from "react";

type ActionButtonProps = {
  label: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function ActionButton({ label, ...buttonProps }: ActionButtonProps) {
  return (
    <button className="action-btn" {...buttonProps}>
      {label}
    </button>
  );
}
