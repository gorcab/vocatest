import { Card } from "./Card";
import { Skeleton } from "./Skeleton";

export const SkeletonCard: React.FC = () => {
  return (
    <Card as="li">
      <div className="p-5">
        <Skeleton width="60%" height={25} color="#e7e7e7" marginBottom={10} />
        <Skeleton width="30%" height={25} color="#e7e7e7" marginBottom={10} />
        <Skeleton width="50%" height={25} color="#e7e7e7" marginBottom={40} />
        <Skeleton width="90%" height={25} color="#e7e7e7" />
      </div>
    </Card>
  );
};
