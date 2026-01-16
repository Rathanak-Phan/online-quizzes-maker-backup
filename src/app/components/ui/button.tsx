// src/components/ui/button.tsx
import { FC, ButtonHTMLAttributes } from "react";
import cn from "classnames";

export const Button: FC<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" }> = ({
  children,
  className,
  variant = "default",
  ...props
}) => {
  const base = "px-4 py-2 rounded-md font-medium";
  const style = variant === "default" ? "bg-primary text-white hover:bg-primary/90" : "border border-gray-300 text-gray-700 hover:bg-gray-100";
  return (
    <button {...props} className={cn(base, style, className)}>
      {children}
    </button>
  );
};
