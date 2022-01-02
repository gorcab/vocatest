import { CSSProperties } from "react";

type DefaultButtonProps = {
  style?: CSSProperties;
  disabled?: boolean;
};

type ButtonProps =
  | (DefaultButtonProps & { type: "button"; onClick: () => void })
  | (DefaultButtonProps & {
      type: "submit";
      onClick?: undefined;
    });

export const Button: React.FC<ButtonProps> = ({
  type,
  disabled = false,
  onClick,
  style,
  children,
}) => {
  return (
    <button
      onClick={onClick}
      style={style}
      className="bg-blue-500 hover:opacity-90 focus:opacity-90 text-white rounded p-1 flex justify-center items-center w-full disabled:opacity-70 focus:outline focus:outline-offset-2 focus:outline-2"
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
