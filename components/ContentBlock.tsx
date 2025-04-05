import { ReactNode } from "react";

export type ContentBlockProps = {
  children?: ReactNode;
  containerClassName?: string;
  blockClassName?: string;
};

function ContentBlock({ children, ...props }: ContentBlockProps) {
  return (
    <section {...props} className="flex flex-1 justify-center items-center">
      <section className="flex flex-row justify-around text-mc-text bg-mc-primary w-[55vw] min-w-72 opacity-95 rounded-[1.5rem] mt-auto mb-auto mc-blur transition-colors duration-500 p-6 max-h-[75vh] self-center">
        {children}
      </section>
    </section>
  );
}

export default ContentBlock;
