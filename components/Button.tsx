"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export default function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-xl transition-transform duration-150 active:scale-95 shadow-md font-bold min-h-[60px] flex items-center justify-center cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
