import { Skeleton } from "../../common/components/Skeleton";
import { CreateVocabularySkeletonCard } from "./CreateVocabularySkeletonCard";

export const CreateVocabularySkeletonTemplate = () => {
  return (
    <>
      <div className="mb-10 w-full">
        <div className="flex flex-col justify-center w-full md:w-1/2 mb-3">
          <Skeleton height={25} className="w-full mb-2" />
        </div>
        <div className="flex flex-col justify-center w-full md:w-1/2 mb-3">
          <Skeleton height={25} className="w-full" />
        </div>
      </div>
      <CreateVocabularySkeletonCard />
      <CreateVocabularySkeletonCard />
    </>
  );
};
