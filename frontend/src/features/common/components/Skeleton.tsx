type SkeletonType = {
  width: string | number;
  height: string | number;
  marginBottom?: string | number;
  color: string;
};

export const Skeleton: React.FC<SkeletonType> = ({
  width,
  height,
  color,
  marginBottom,
}) => {
  return (
    <div
      style={{ width, height, backgroundColor: color, marginBottom }}
      className="animate-pulse mb-2 rounded-xl"
    />
  );
};
