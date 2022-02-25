import React, { useEffect } from "react";
import { SubmitHandler } from "react-hook-form";
import { Navigate, useLocation } from "react-router";
import { useCreateVocabularyListMutation } from "features/api/slice";
import { CategoryDto, CreateVocabularyDto } from "features/api/types";
import { is4XXError, is5XXError } from "features/common/utils/helper";
import { useToast } from "features/toast/hooks/useToast";
import {
  VocabularyListForm,
  VocabularyListFormDto,
} from "features/vocabulary/components/VocabularyListForm";

type CreateVocabularyListFormDto = {
  title: string;
  categoryId: number;
  vocabularies: Array<CreateVocabularyDto>;
};

type CreateVocabularyListTemplateProps = {
  categories: Array<CategoryDto>;
};

export const CreateVocabularyListTemplate: React.FC<CreateVocabularyListTemplateProps> =
  ({ categories }) => {
    const location = useLocation();
    const [createVocabularyList, { isLoading, isSuccess, error }] =
      useCreateVocabularyListMutation();
    const toast = useToast();
    const defaultFieldValues: CreateVocabularyListFormDto = {
      title: "",
      categoryId: location.state?.categoryId ?? categories[0].id,
      vocabularies: [{ english: "", korean: "", examples: [] }],
    };

    useEffect(() => {
      if (!error) return;
      if (is4XXError(error)) {
        toast({
          type: "INFO",
          desc: error.data.message || "단어장 생성에 실패했습니다.",
        });
      } else if (is5XXError(error)) {
        toast({
          type: "INFO",
          desc: "서버 측 에러로 인해 단어장 생성에 실패했습니다. 잠시 후에 다시 시도해주세요.",
        });
      }
    }, [error, toast]);

    const formSubmitHandler: SubmitHandler<VocabularyListFormDto> = (data) => {
      createVocabularyList(data);
    };

    if (isSuccess) {
      return <Navigate to={location.state?.from ?? "/"} />;
    }

    return (
      <VocabularyListForm
        type="create"
        categories={categories}
        defaultFieldValues={defaultFieldValues}
        isMutationLoading={isLoading}
        submitHandler={formSubmitHandler}
      />
    );
  };
