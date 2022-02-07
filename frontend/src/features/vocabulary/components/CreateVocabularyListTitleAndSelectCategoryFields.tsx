import { useCallback, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useLocation } from "react-router";
import { CategoryDto } from "../../api/types";
import { InputErrorMessage } from "../../common/components/InputErrorMessage";
import { Select } from "../../common/components/Select/Select";
import { CreateVocabularyListFormDto } from "./CreateVocabularyListTemplate";

type CreateVocabularyListTitleAndSelectCategoryFieldsProps = {
  categories: Array<CategoryDto>;
};

export const CreateVocabularyListTitleAndSelectCategoryFields: React.FC<CreateVocabularyListTitleAndSelectCategoryFieldsProps> =
  ({ categories }) => {
    const {
      register,
      setValue,
      setError,
      clearErrors,
      formState: { errors },
    } = useFormContext<CreateVocabularyListFormDto>();
    const location = useLocation();

    useEffect(() => {
      register("categoryId", { required: "카테고리를 선택해주세요." });
    }, [register]);

    const categoryIdCangeHandler = useCallback(
      (value: number) => {
        setValue("categoryId", value);
        clearErrors("categoryId");
      },
      [setValue, clearErrors]
    );

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

    return (
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
            {...register("title", {
              required: "단어장명을 입력해주세요.",
            })}
          />
          {errors.title ? (
            <InputErrorMessage as="span" style={{ marginTop: "0.3rem" }}>
              {errors.title.message}
            </InputErrorMessage>
          ) : null}
        </div>
        <div className="flex flex-col w-full md:w-1/2">
          <Select
            options={categories.map(({ id, name }) => ({
              value: id,
              label: name,
            }))}
            onBlur={categorySelectBlurHandler}
            onChange={categoryIdCangeHandler}
            selectLabel="카테고리"
            initialValue={location.state?.categoryId ?? undefined}
          />
          {errors.categoryId ? (
            <InputErrorMessage as="span" style={{ marginTop: "0.3rem" }}>
              {errors.categoryId.message}
            </InputErrorMessage>
          ) : null}
        </div>
      </div>
    );
  };
