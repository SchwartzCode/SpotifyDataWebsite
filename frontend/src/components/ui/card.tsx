// src/components/ui/card.tsx - Updated version

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => (
  <div className={`bg-spotify-dark-gray shadow-lg rounded-lg p-4 w-full ${className}`}>{children}</div>
);

export const CardContent = ({ children, className = "" }: CardProps) => (
  <div className={`text-spotify-off-white w-full ${className}`}>{children}</div>
);

export const CardHeader = ({ children, className = "" }: CardProps) => (
  <div className={`border-b pb-2 mb-2 text-lg font-bold ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = "" }: CardProps) => (
  <h3 className={`text-spotify-off-white font-semibold ${className}`}>{children}</h3>
);