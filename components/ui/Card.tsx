import { ReactNode } from "react";

type CardPadding = "none" | "sm" | "md" | "lg";

type CardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: CardPadding;
  onClick?: () => void;
};

const paddings: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export default function Card({
  children,
  className = "",
  hover = false,
  padding = "md",
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-ev-surface border border-ev-stroke rounded-2xl
        ${paddings[padding]}
        ${hover ? "transition-all duration-200 hover:bg-ev-surface-2 hover:border-ev-stroke/80 hover:shadow-ev-card cursor-pointer" : ""}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
}
