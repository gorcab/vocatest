import { CSSProperties } from "react";

type InputGroupProps = {
  style?: CSSProperties;
};

export const InputGroup: React.FC<InputGroupProps> = ({ children, style }) => {
  return (
    <div style={style} className="w-full relative mb-4">
      {children}
    </div>
  );
};
