import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import { useEditVocabularyListMutation } from "features/api/slice";
import {
  CategoryDto,
  CreateVocabularyDto,
  DetailedVocabularyListDto,
} from "features/api/types";
import { is4XXError, is5XXError } from "features/common/utils/helper";
import { useToast } from "features/toast/hooks/useToast";
import {
  VocabularyListForm,
  VocabularyListFormDto,
} from "features/vocabulary/components/VocabularyListForm";
import { useCallback, useEffect } from "react";
import { SubmitHandler } from "react-hook-form";
import { Navigate, useLocation } from "react-router";

type EditVocabularyListFormDto = {
  title: string;
  categoryId: number;
  vocabularies: Array<CreateVocabularyDto>;
};

type EditVocabularyListTemplateProps = {
  vocabularyList: DetailedVocabularyListDto;
  categories: Array<CategoryDto>;
};

export const EditVocabularyListTemplate: React.FC<EditVocabularyListTemplateProps> =
  ({ categories, vocabularyList }) => {
    const toast = useToast();
    const location = useLocation();
    const { title, category, vocabularies, id } = vocabularyList;
    const defaultFieldValues: EditVocabularyListFormDto = {
      title,
      categoryId: category.id,
      vocabularies: vocabularies.map(({ english, korean, examples }) => ({
        english,
        korean,
        examples: examples ?? [],
      })),
    };
    const [editVocabularyList, { isLoading, isSuccess, error }] =
      useEditVocabularyListMutation();

    useEffect(() => {
      if (!error) return;
      if (is4XXError(error)) {
        toast({
          type: "INFO",
          desc: error.data.message || "단어장 수정에 실패했습니다.",
        });
      } else if (is5XXError(error)) {
        toast({
          type: "INFO",
          desc: "서버 측 에러로 인해 단어장 수정에 실패했습니다. 잠시 후에 다시 시도해주세요.",
        });
      }
    }, [error, toast]);

    const formSubmitHandler: SubmitHandler<VocabularyListFormDto> = (data) => {
      editVocabularyList({
        vocabularyId: id,
        editVocabularyListDto: data,
      });
    };

    if (isSuccess) {
      return <Navigate to={location.state?.from ?? "/"} />;
    }

    return (
      <VocabularyListForm
        type="edit"
        categories={categories}
        isMutationLoading={isLoading}
        defaultFieldValues={defaultFieldValues}
        submitHandler={formSubmitHandler}
      />
    );
  };
