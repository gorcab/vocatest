import { useCategoryQuery } from "features/api/slice";
import { Skeleton } from "features/common/components/Skeleton";
import { is4XXError, is5XXError } from "features/common/utils/helper";
import { CategoryLinkItem } from "./CategoryLinkItem";

export const CategoryLinkList: React.FC = () => {
  const { data, isFetching, error, refetch } = useCategoryQuery();

  if (isFetching) {
    return (
      <div className="flex flex-col justify-center items-center mt-5">
        <Skeleton width="100%" color="#e7e7e7" height={25} marginBottom={20} />
        <Skeleton width="100%" color="#e7e7e7" height={25} marginBottom={20} />
        <Skeleton width="100%" color="#e7e7e7" height={25} marginBottom={20} />
        <Skeleton width="100%" color="#e7e7e7" height={25} marginBottom={20} />
      </div>
    );
  }

  if (is4XXError(error) || is5XXError(error)) {
    return (
      <div className="flex justify-center items-center mt-5 flex-col">
        <h2 role="alert" className="text-slate-500 text-sm mb-3">
          카테고리 조회 실패
        </h2>
        <div className="flex justify-center items-center w-full">
          <button
            className="bg-red-600 w-full py-1 px-3 rounded text-white"
            onClick={refetch}
          >
            재요청
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {data && (
        <ul className="flex flex-col mt-3">
          {data.map(({ id, name }) => (
            <CategoryLinkItem
              key={id}
              id={id}
              name={name}
              path={`/?category=${id}`}
            />
          ))}
        </ul>
      )}
    </>
  );
};
