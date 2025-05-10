import { ReactNode } from "react";

export type ContentBlockProps = {
  children?: ReactNode;
  containerClassName?: string;
  blockClassName?: string;
};

function ContentBlock({
  children,
  containerClassName,
  blockClassName,
}: ContentBlockProps) {
  return (
    <section
      className={`flex flex-1 justify-center ${containerClassName || ""}`}
    >
      <section
        className={`flex h-[70vh] overflow-x-auto flex-col justify-start text-ev-text bg-ev-primary w-full min-w-72 opacity-95 rounded-[1.5rem] mb-auto ev-blur transition-colors duration-500 p-6 ${blockClassName || ""}`}
      >
        {children}
      </section>
    </section>
  );
}

export default ContentBlock;
