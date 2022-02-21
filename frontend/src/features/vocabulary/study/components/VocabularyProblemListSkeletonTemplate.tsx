import { Separator } from "features/common/components/Separator";
import { Skeleton } from "features/common/components/Skeleton";

export const VocabularyProblemListSkeletonTemplate: React.FC = () => {
  return (
    <div className="flex flex-col h-[70vh]">
      <header>
        <div className="w-full flex flex-row">
          <div className="flex flex-col justify-center w-max mb-3">
            <Skeleton height={30} width={100} className="" />
          </div>
        </div>
        <Separator />
        <div className="flex justify-end mt-3">
          <Skeleton height={30} className="w-full max-w-[200px]" />
        </div>
      </header>
      <div className="flex-grow flex flex-col justify-center items-center overflow-y-auto">
        <div className="h-[200px] w-full md:w-9/12 md:max-w-sm md:m-auto flex justify-center items-center shadow-sm border mb-5">
          <Skeleton height={30} className="w-10/12" />
        </div>
      </div>
    </div>
  );
};
