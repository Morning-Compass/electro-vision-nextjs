import { ReactNode } from "react";

export type ContentBlockProps = {
  children?: ReactNode;
  containerClassName?: string;
  blockClassName?: string;
};

export default function ContentBlock({
  children,
  containerClassName,
  blockClassName,
}: ContentBlockProps) {
  return (
    <div
      className={`flex flex-1 min-w-0 flex-col overflow-hidden ${containerClassName ?? ""}`}
    >
      <div
        className={`
          flex-1 flex flex-col overflow-y-auto
          text-ev-text bg-ev-main-bg
          transition-colors duration-300
          ${blockClassName ?? ""}
        `.trim()}
      >
        {children}
      </div>
    </div>
  );
}
