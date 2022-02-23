import { useEditVocabularyListMutation } from "features/api/slice";
import {
  CategoryDto,
  CreateVocabularyDto,
  DetailedVocabularyListDto,
} from "features/api/types";
import { Button } from "features/common/components/Button";
import { is4XXError, is5XXError } from "features/common/utils/helper";
import { useToast } from "features/toast/hooks/useToast";
import { CreateVocabularyCardList } from "features/vocabulary/create/components/CreateVocabularyCardList";
import { CreateVocabularyListTitleAndSelectCategoryField } from "features/vocabulary/create/components/CreateVocabularyListTitleAndSelectCategoryField";
import { useEffect } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { Navigate, useLocation } from "react-router";

export type EditVocabularyListFormDto = {
  title: string;
  categoryId: number;
  vocabularies: Array<CreateVocabularyDto>;
};

type EditVocabularyListTemplateProps = {
  vocabularyList: DetailedVocabularyListDto;
  categories: Array<CategoryDto>;
};

export const EditVocabularyListTemplate: React.FC<EditVocabularyListTemplateProps> =
  ({ vocabularyList, categories }) => {
    const location = useLocation();
    const toast = useToast();
    const [editVocabularyList, { isLoading, isSuccess, error, reset }] =
      useEditVocabularyListMutation();
    const methods = useForm<EditVocabularyListFormDto>({
      shouldUnregister: true,
      defaultValues: {
        title: vocabularyList.title,
        categoryId: vocabularyList.category.id,
        vocabularies: vocabularyList.vocabularies.map(
          ({ english, korean, examples }) => ({
            english,
            korean,
            examples: examples ?? [],
          })
        ),
      },
    });

    useEffect(() => {
      if (!error) return;

      if (is4XXError(error)) {
        toast({ type: "INFO", desc: "단어장 수정에 실패했습니다." });
        reset();
      } else if (is5XXError(error)) {
        toast({
          type: "INFO",
          desc: "서버 측 에러로 인해 단어장 생성에 실패했습니다. 잠시 후에 다시 시도해주세요.",
        });
        reset();
      }
    }, [error, toast, reset]);

    if (isSuccess) {
      return <Navigate to={location.state.from ?? "/"} />;
    }

    const onSubmit: SubmitHandler<EditVocabularyListFormDto> = (data) => {
      editVocabularyList({
        vocabularyId: vocabularyList.id,
        editVocabularyListDto: data,
      });
    };

    return (
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          aria-label="단어장 수정 폼"
        >
          <CreateVocabularyListTitleAndSelectCategoryField
            categories={categories}
          />
          <CreateVocabularyCardList />
          <div className="flex justify-center mt-5">
            <Button className="!w-56 h-10" type="submit" disabled={isLoading}>
              수정하기
            </Button>
          </div>
        </form>
      </FormProvider>
    );
  };
