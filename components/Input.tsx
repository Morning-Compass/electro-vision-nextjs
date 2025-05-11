import { UseFormRegister } from "react-hook-form";
import { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  register?: any;
  customWidth?: string;
}

const Input = ({
  error,
  register,
  customWidth = undefined,
  ...props
}: InputProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center ${customWidth ?? ""}`}
    >
      <input {...register} {...props} />
      {error && <span className="text-red-500 text-sm ">{error}</span>}
    </div>
  );
};

export default Input;
