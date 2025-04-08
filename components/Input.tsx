import { UseFormRegister } from "react-hook-form";

type InputProps = {
  type: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  register?: any;
  value?: string;
};

const Input = ({ error, register, name, ...props }: InputProps) => {
  return (
    <div>
      <input {...register} {...props} />
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
};

export default Input;
