// src/components/ui/card.tsx
import { FC, ReactNode } from "react";
import cn from "classnames";

export const Card: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("border rounded-lg bg-white shadow-sm", className)}>{children}</div>
);

export const CardHeader: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("p-4 border-b", className)}>{children}</div>
);

export const CardTitle: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <h3 className={cn("font-semibold text-lg", className)}>{children}</h3>
);

export const CardDescription: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <p className={cn("text-sm text-gray-500", className)}>{children}</p>
);

export const CardContent: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("p-4", className)}>{children}</div>
);
