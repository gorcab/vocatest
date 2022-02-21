type SeparatorProps = {
  className?: string;
};

export const Separator: React.FC<SeparatorProps> = ({ className }) => {
  return (
    <hr
      className={`border h-0 border-gray-200${
        className ? ` ${className}` : ""
      }`}
    />
  );
};
