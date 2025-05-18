import { ReactNode } from "react";
import Image from "next/image";
import Input from "@/components/Input";

export type OverlayProps = {
  children?: ReactNode;
  blockClassName?: string;
  isOpen: boolean;
  onClose: () => void;
  buttons?: ReactNode; // Add this for custom buttons
  closeButton?: ReactNode; // Add this for custom close button
  hideDefaultCloseButton?: boolean; // Add this to hide default close button
};

function Overlay({
  children,
  blockClassName,
  isOpen,
  onClose,
  buttons,
  closeButton,
  hideDefaultCloseButton = false,
}: OverlayProps) {
  if (!isOpen) return null;

  return (
    <section className="fixed inset-0 bg-overlay z-10 flex justify-center items-center overflow-y-scroll">
      <section
        className={`relative w-auto h-auto p-10 flex flex-col items-center bg-ev-primary rounded-3xl ${blockClassName || ""}`}
      >
        {!hideDefaultCloseButton &&
          (closeButton || (
            <Image
              src="/cancel.png"
              alt="Cancel"
              width={48}
              height={48}
              className="absolute top-5 right-5 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-200"
              onClick={onClose}
            />
          ))}
        <div className="mt-16">{children}</div>
        {buttons && (
          <div className="mt-10 flex gap-4 w-full justify-center">
            {buttons}
          </div>
        )}
      </section>
    </section>
  );
}

export default Overlay;
