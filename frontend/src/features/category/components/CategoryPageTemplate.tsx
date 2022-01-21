import { useNavigate } from "react-router";
import { useCategoryQuery } from "../../api/slice";
import { Button } from "../../common/components/Button";
import { MainContainer } from "../../common/components/MainContainer";
import { MainHeader } from "../../common/components/MainHeader";
import { NotFoundPage } from "../../../pages/NotFoundPage";
import { SkeletonCardList } from "../../common/components/SkeletonCardList";
import { useSearchUrl } from "../../common/hooks/useSearchUrl";
import { Skeleton } from "../../common/components/Skeleton";
import { CategoryDropdownMenu } from "./CategoryDropdownMenu";
import { VocabularyListSection } from "../../vocabulary/components/VocabularyListSection";
import { useState } from "react";
import { EditCategoryFormModal } from "./EditCategoryFormModal";

export const CategoryPageTemplate: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const {
    pagedVocabularyListsRequest: { perPage, category: categoryId },
  } = useSearchUrl();
  const { data: categories, isFetching } = useCategoryQuery();
  const category = categories?.find((category) => category.id === categoryId);

  if (isFetching) {
    return (
      <MainContainer>
        <MainHeader>
          <div className="flex justify-between h-full">
            <Skeleton width={150} height={30} color="#e7e7e7" />
          </div>
        </MainHeader>
        <SkeletonCardList length={perPage} />
        <span role="status" className="sr-only">
          데이터를 불러오는 중입니다.
        </span>
      </MainContainer>
    );
  }

  if (!category) {
    return <NotFoundPage />;
  }

  const createVocabularyListHandler = () => {
    navigate(`/create-vocabulary/?category=${category!.id}`);
  };

  const editCategoryModalCloseHandler = () => setOpen(false);

  return (
    <MainContainer>
      <MainHeader
        title={category.name}
        rightElement={
          <div className="flex items-center">
            <CategoryDropdownMenu category={category} />
            <Button
              type="button"
              onClick={createVocabularyListHandler}
              className="!w-auto px-2 ml-3"
            >
              단어장 생성
            </Button>
          </div>
        }
      />
      <VocabularyListSection />
      <EditCategoryFormModal
        category={category}
        isOpen={open}
        modalCloseHandler={editCategoryModalCloseHandler}
      />
    </MainContainer>
  );
};
