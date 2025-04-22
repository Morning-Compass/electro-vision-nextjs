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
  onClick?: () => void;
};

const Input = ({ error, register, name, onClick, ...props }: InputProps) => {
  return (
    <div>
      <input {...register} onClick={onClick} {...props} />
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
};

export default Input;
