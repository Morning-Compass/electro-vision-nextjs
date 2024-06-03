import { ReactNode } from "react";

export type FooterMainProps = {
  children: ReactNode;
  [key: string]: unknown;
  center?: boolean;
  customHeight?: string;
};

export function FooterMain({
  children,
  center = undefined,
  customHeight = undefined,
}: FooterMainProps) {
  return (
    <div
      className={`flex flex-col ${center === true ? "items-center justify-center" : ""} ${customHeight ?? ""}`}
    >
      {children}
    </div>
  );
}
