import { Skeleton } from "features/common/components/Skeleton";

export const CreateVocabularySkeletonCard = () => {
  return (
    <div className="w-full bg-white mb-5 rounded-md shadow-md relative">
      <div className="flex items-center justify-between px-4 py-2 border-b border-stone-300">
        <Skeleton height={25} width={30} />
        <Skeleton height={25} width={50} />
      </div>
      <div className="grid grid-cols-1 items-center md:grid-cols-2 md:gap-x-8 px-4 h-24">
        <Skeleton height={20} className="w-full" />
        <Skeleton height={20} className="w-full" />
      </div>
    </div>
  );
};
