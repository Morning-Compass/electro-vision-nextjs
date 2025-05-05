import { ReactNode } from "react";
import Image from "next/image";
import Input from "@/components/Input";

export type OverlayProps = {
  children?: ReactNode;
  blockClassName?: string;
  isOpen: boolean;
  onClose: () => void;
};

function Overlay({ children, blockClassName, isOpen, onClose }: OverlayProps) {
  if (!isOpen) return null;

  return (
    <section
      className="fixed inset-0 bg-overlay z-10 flex justify-center items-center"
    >
      <section
        className={`relative w-auto h-auto p-10 flex flex-col items-center bg-white rounded-3xl ${blockClassName || ""}`}
      >
        <Image
          src="/cancel.png"
          alt="Cancel"
          width={48}
          height={48}
          className="absolute top-5 right-5 cursor-pointer"
          onClick={onClose}
        />
        {children}
        <Input
          name="ok_button"
          type="button"
          className="mt-10 text-white border-4 bg-ev-green rounded-lg w-96 h-12 hover:scale-110 duration-300"
          value="Ok"
          onClick={onClose}
        />
      </section>
    </section>
  );
}

export default Overlay;
