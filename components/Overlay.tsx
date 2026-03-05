import { ReactNode } from "react";
import { X } from "lucide-react";

export type OverlayProps = {
  children?: ReactNode;
  blockClassName?: string;
  isOpen: boolean;
  onClose: () => void;
  buttons?: ReactNode;
  closeButton?: ReactNode;
  hideDefaultCloseButton?: boolean;
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
    <section className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 flex justify-center items-center overflow-y-auto p-4">
      <section
        className={`relative w-auto h-auto p-8 flex flex-col items-center bg-[#1e293b] border border-[#334155] rounded-2xl shadow-2xl ${blockClassName || ""}`}
      >
        {!hideDefaultCloseButton &&
          (closeButton || (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#334155] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ))}
        <div className="mt-10">{children}</div>
        {buttons && (
          <div className="mt-8 flex gap-4 w-full justify-center">
            {buttons}
          </div>
        )}
      </section>
    </section>
  );
}

export default Overlay;
