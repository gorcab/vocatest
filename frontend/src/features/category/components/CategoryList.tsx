import { useCategoryQuery } from "../../api/slice";
import { Spinner } from "../../common/components/Spinner";
import { CategoryItem } from "./CategoryItem";

export const CategoryList: React.FC = () => {
  const { data, isFetching, error, refetch } = useCategoryQuery();

  if (isFetching) {
    return (
      <div className="flex justify-center items-center mt-5">
        <Spinner color="#c3c3c3" gap={2} size={50} thickness={2} />
      </div>
    );
  }

  if (error && "data" in error) {
    return (
      <div className="flex justify-center items-center mt-5 flex-col">
        <p className="text-slate-500 text-sm mb-3">카테고리 조회 실패</p>
        <div className="flex justify-center items-center w-full">
          <button
            className="bg-red-600 w-full py-1 px-3 rounded text-white"
            onClick={refetch}
          >
            재시도
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
            <CategoryItem
              key={id}
              id={id}
              name={name}
              path={`/categories/${id}`}
            />
          ))}
        </ul>
      )}
    </>
  );
};
