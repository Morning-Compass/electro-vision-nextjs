import React from "react";

type InputProps = {
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const Input = ({
  type,
  name,
  value,
  onChange,
  disabled,
  required = undefined,
  placeholder = undefined,
  className = undefined,
  ...props
}: InputProps) => {
  return (
    <input
      {...props}
      type={type}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled ?? false}
      required={required ?? true}
      className={
        className ??
        "border-4 bg-white text-black border-solid rounded-2xl max-w-[40rem] min-w-56 w-[30vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300 focus:scale-110 focus:outline-none focus:bg-slate-800 focus:text-emerald-500 focus:border-slate-800"
      }
    />
  );
};

export default Input;
