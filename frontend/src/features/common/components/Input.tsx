import { CSSProperties, HTMLInputTypeAttribute } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

type InputProps = {
  register: UseFormRegisterReturn;
  id: string;
  style?: CSSProperties;
  type: HTMLInputTypeAttribute;
  isReadonly?: boolean;
  isError?: boolean;
};

export const Input: React.FC<InputProps> = ({
  register,
  id,
  style,
  type,
  isReadonly = false,
  isError = false,
}) => {
  return (
    <input
      readOnly={isReadonly}
      style={style}
      type={type}
      id={id}
      className="w-full border rounded mb-2 p-1"
      aria-invalid={isError ? "true" : "false"}
      {...register}
    />
  );
};
