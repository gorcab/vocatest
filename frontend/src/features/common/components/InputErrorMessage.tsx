import React, { CSSProperties } from "react";

type InputErrorMessageProps = {
  as: React.ElementType;
  isCenter?: boolean;
  style?: CSSProperties;
};

export const InputErrorMessage: React.FC<InputErrorMessageProps> = ({
  as: Component,
  isCenter = false,
  style,
  children,
}) => {
  let className = "text-red-500 text-sm";
  if (isCenter) {
    className += " text-center";
  }

  return (
    <Component style={style} role="alert" className={className}>
      {children}
    </Component>
  );
};
