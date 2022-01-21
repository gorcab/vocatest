import { SkeletonCard } from "./SkeletonCard";

type SkeletonCardListProps = {
  length: number;
};

export const SkeletonCardList: React.FC<SkeletonCardListProps> = ({
  length,
}) => {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </ul>
  );
};
