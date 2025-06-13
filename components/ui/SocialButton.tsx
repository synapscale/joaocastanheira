import React from "react";

interface SocialButtonProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}

export function SocialButton({ icon, children, onClick, className, type = "button" }: SocialButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 w-full h-12 rounded-lg border bg-white hover:bg-gray-100 transition text-gray-700 font-medium shadow-sm ${className || ""}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
} 