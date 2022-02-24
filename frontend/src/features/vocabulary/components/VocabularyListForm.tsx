import { SerializedError } from "@reduxjs/toolkit";
import { useEffect } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query";
import {
  useCreateVocabularyListMutation,
  useEditVocabularyListMutation,
} from "features/api/slice";
import { CategoryDto, CreateVocabularyDto } from "features/api/types";
import { Button } from "features/common/components/Button";
import { InputErrorMessage } from "features/common/components/InputErrorMessage";
import { Spinner } from "features/common/components/Spinner";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { Navigate, useLocation } from "react-router";
import { CategorySelect } from "./CategorySelect";
import { VocabularyFormFieldList } from "./VocabularyFormFieldList";

export type VocabularyListFormDto = {
  title: string;
  categoryId: number;
  vocabularies: Array<CreateVocabularyDto>;
};

type VocabularyListFormProps = {
  type: "edit" | "create";
  defaultFieldValues: VocabularyListFormDto;
  categories: Array<CategoryDto>;
  isMutationLoading: boolean;
  submitHandler: SubmitHandler<VocabularyListFormDto>;
};

export const VocabularyListForm: React.FC<VocabularyListFormProps> = ({
  type,
  categories,
  defaultFieldValues,
  isMutationLoading,
  submitHandler,
}) => {
  const methods = useForm<VocabularyListFormDto>({
    shouldUnregister: true,
    defaultValues: defaultFieldValues,
  });

  const {
    register,
    formState: { errors },
    clearErrors,
    setError,
    getValues,
    setValue,
    control,
  } = methods;

  const categoryId = getValues("categoryId");

  const onSubmit = methods.handleSubmit(submitHandler);

  const categorySelectBlurHandler = (value: number) => {
    const isSelected = categories.find((category) => category.id === value);
    if (isSelected && errors.categoryId) {
      clearErrors("categoryId");
    } else if (!isSelected) {
      setError("categoryId", {
        type: "required",
      });
    }
  };

  const categoryIdCangeHandler = (value: number) => {
    setValue("categoryId", value);
    clearErrors("categoryId");
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        aria-label={type === "create" ? "단어장 생성 폼" : "단어장 수정 폼"}
      >
        <div className="mb-10 w-full">
          <div className="flex flex-col w-full md:w-1/2 mb-5">
            <label
              htmlFor="title"
              className="text-gray-700 text-sm inline-block pb-2"
            >
              단어장명
            </label>
            <input
              id="title"
              className="border-b border-slate-400 bg-transparent focus:border-blue-500 outline-none"
              {...register("title", { required: "단어장명을 입력해주세요." })}
            />
            {errors.title && (
              <InputErrorMessage as="span" style={{ marginTop: "0.3rem" }}>
                {errors.title.message}
              </InputErrorMessage>
            )}
          </div>
          <div className="flex-flex-col w-full md:w-1/2">
            <CategorySelect
              onBlur={categorySelectBlurHandler}
              onChange={categoryIdCangeHandler}
              categories={categories}
              value={categoryId}
            />
            {errors.categoryId && (
              <InputErrorMessage as="span" style={{ marginTop: "0.3rem" }}>
                {errors.categoryId.message}
              </InputErrorMessage>
            )}
          </div>
        </div>
        <VocabularyFormFieldList control={control} />
        <div className="flex justify-center mt-5">
          <Button
            className="!w-56 h-10"
            type="submit"
            disabled={isMutationLoading}
          >
            {isMutationLoading ? (
              <Spinner thickness={2} gap={2} color="white" size={25} />
            ) : type === "create" ? (
              "생성하기"
            ) : (
              "수정하기"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
