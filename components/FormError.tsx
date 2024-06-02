import React, { ReactNode } from "react";

type FormErrorProps = {
  condition: boolean;
  className?: string;
  children: ReactNode;
};

const FormError = ({ condition, className, children }: FormErrorProps) => {
  return (
    <div
      className={
        className ?? "text-mc-red flex flex-col items-center justify-center"
      }
    >
      {condition ? children : null}
    </div>
  );
};

export default FormError;
