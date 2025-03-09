// src/components/ui/card.tsx

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}

export const Card = ({ children }: CardProps) => (
  <div className="bg-gray-400 shadow-lg rounded-lg p-4">{children}</div>
);

export const CardContent = ({ children }: CardProps) => (
  <div className="text-gray-800">{children}</div>
);

export const CardHeader = ({ children }: CardProps) => (
  <div className="border-b pb-2 mb-2 text-lg font-bold">{children}</div>
);

export const CardTitle = ({ children }: CardProps) => (
  <h3 className="text-xl font-semibold">{children}</h3>
);
