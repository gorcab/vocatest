import { useEffect } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { Navigate, useLocation } from "react-router";
import { useCreateVocabularyListMutation } from "../../api/slice";
import { CategoryDto, CreateVocabularyDto } from "../../api/types";
import { Button } from "../../common/components/Button";
import { is4XXError, is5XXError } from "../../common/utils/helper";
import { useToast } from "../../toast/hooks/useToast";
import { CreateVocabularyCardList } from "./CreateVocabularyCardList";
import { CreateVocabularyListTitleAndSelectCategoryFields } from "./CreateVocabularyListTitleAndSelectCategoryFields";

export type CreateVocabularyListFormDto = {
  title: string;
  categoryId: number;
  vocabularies: Array<CreateVocabularyDto>;
};

type CreateVocabularyListTemplateProps = {
  categories: Array<CategoryDto>;
};

export const CreateVocabularyListTemplate: React.FC<CreateVocabularyListTemplateProps> =
  ({ categories }) => {
    const [createVocabularyList, { isLoading, isSuccess, isError, error }] =
      useCreateVocabularyListMutation();
    const location = useLocation();
    const toast = useToast();
    const methods = useForm<CreateVocabularyListFormDto>({
      shouldUnregister: true,
      defaultValues: {
        vocabularies: [
          {
            english: "",
            korean: "",
            examples: [],
          },
        ],
      },
    });

    useEffect(() => {
      if (isError && (is4XXError(error) || is5XXError(error))) {
        toast({
          type: "ERROR",
          desc:
            error.data.message ||
            "단어장 생성에 실패했습니다. 잠시 후에 다시 시도해주세요.",
        });
      }
    }, [isError, error, toast]);

    if (isSuccess) {
      return (
        <Navigate
          to={
            location.state?.categoryId
              ? `/?category=${location.state.categoryId}`
              : `/`
          }
        />
      );
    }

    const onSubmit: SubmitHandler<CreateVocabularyListFormDto> = (data) => {
      createVocabularyList(data);
    };

    if (categories && categories.length > 0) {
      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <CreateVocabularyListTitleAndSelectCategoryFields
              categories={categories}
            />
            <CreateVocabularyCardList />
            <div className="flex justify-center mt-5">
              <Button className="!w-56 h-10" type="submit" disabled={isLoading}>
                생성하기
              </Button>
            </div>
          </form>
        </FormProvider>
      );
    }

    return <Navigate to="/" />;
  };
