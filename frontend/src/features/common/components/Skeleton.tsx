type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  marginBottom?: string | number;
  color?: string;
  className?: string;
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "auto",
  height = "auto",
  color = "#e7e7e7",
  className,
  marginBottom,
}) => {
  let defaultClassName = "animate-pulse rounded-md";
  return (
    <div
      style={{ width, height, backgroundColor: color, marginBottom }}
      className={
        className ? `${defaultClassName} ${className}` : defaultClassName
      }
    />
  );
};
