import React from "react";

type CardType = {
  as: React.ElementType;
  className?: string;
};

export const Card: React.FC<CardType> = ({
  as: Component,
  className,
  children,
}) => {
  let defaultClassName = `block relative shadow-lg shadow-blue-400/20 rounded-sm h-[200px] mb-3`;
  if (className) {
    defaultClassName += ` ${className}`;
  }
  return <Component className={defaultClassName}>{children}</Component>;
};
