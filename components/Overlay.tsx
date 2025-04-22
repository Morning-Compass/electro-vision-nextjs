import { ReactNode } from "react";
import Image from "next/image";
import Input from "@/components/Input";

export type OverlayProps = {
  children?: ReactNode;
  blockClassName?: string;
  id?: string;
};

function Overlay({
  children,
  blockClassName,
  id,
}: OverlayProps) {
  function off() {
    const overlay = document.getElementById(id || "overlay");
    if (overlay) {
      overlay.style.display = "none";
    }
  }

  return (
    <section
      className={`fixed hidden w-fill h-full top-0 left-0 right-0 bottom-0 bg-overlay z-10`}
      id={id || "overlay"}
    >
      <section
        className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-auto h-auto pl-20 pr-20 pt-14 pb-10 flex flex-col items-center bg-white rounded-3xl ${blockClassName || ""}`}
      >
        <Image
          src="/cancel.png"
          alt="Cancel"
          width={0}
          height={0}
          className="absolute w-12 h-12 top-5 right-5 cursor-pointer"
          onClick={() => {off()}}
        />
        {children}
        <Input
          name="ok_button"
          type="button"
          className="text-white border-4 bg-ev-green border-none rounded-[0.9rem] w-96 max-h-12 min-h-8 h-[10vh] pl-4 pr-4 mt-10 hover:scale-110 duration-300"
          value="Ok"
          onClick={() => {off()}}
        />
      </section>
    </section>
  );
}

export default Overlay;
