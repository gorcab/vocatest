import { useEditCategoryMutation } from "features/api/slice";
import { CategoryDto, EditCategoryRequest } from "features/api/types";
import { is4XXError, is5XXError } from "features/common/utils/helper";
import { useToast } from "features/toast/hooks/useToast";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

export type EditCategoryDto = Omit<EditCategoryRequest, "id">;

export const useEditCategoryForm = (
  isOpen: boolean,
  category: CategoryDto,
  modalCloseHandler: () => void
) => {
  const toast = useToast();
  const [editCategory, mutationResult] = useEditCategoryMutation();
  const {
    reset: mutationReset,
    isSuccess: isEditSuccess,
    isLoading: isEditLoading,
    error: mutationError,
  } = mutationResult;

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    reset: formReset,
    setError: setFormError,
  } = useForm<EditCategoryDto>({
    defaultValues: {
      name: category.name,
    },
  });

  const categoryNameFieldRef = useRef<HTMLInputElement | null>(null);
  const registeredNameResult = register("name", {
    required: "변경할 카테고리명을 입력해주세요.",
    validate: {
      whiteSpaceCategoryName: (value) =>
        value.trim() !== "" ||
        "공백으로만 구성된 카테고리명은 사용할 수 없습니다.",
      sameName: (value) =>
        value !== category.name || "동일한 카테고리명입니다.",
    },
  });
  const { ref } = registeredNameResult;
  const registerNameRef = (inputElement: HTMLInputElement) => {
    ref(inputElement);
    categoryNameFieldRef.current = inputElement;
  };

  const submitHandler = handleSubmit(({ name }) => {
    mutationReset();
    editCategory({
      id: category.id,
      name,
    });
  });

  useEffect(() => {
    if (isEditSuccess) {
      mutationReset();
      formReset();
      modalCloseHandler();
    } else if (is4XXError(mutationError) || is5XXError(mutationError)) {
      const message = mutationError.data.message;
      if (/카테고리명/.test(message)) {
        setFormError("name", {
          type: "manual",
          message,
        });
      } else {
        toast({
          type: "ERROR",
          desc:
            message ||
            "카테고리 수정에 실패했습니다. 잠시 후에 다시 시도해주세요.",
        });
        mutationReset();
      }
    }
  }, [
    isEditSuccess,
    mutationReset,
    formReset,
    modalCloseHandler,
    setFormError,
    mutationError,
    toast,
  ]);

  useEffect(() => {
    if (!isOpen) {
      formReset();
      mutationReset();
    }
  }, [isOpen, formReset, mutationReset]);

  return {
    categoryNameFieldRef,
    isEditLoading,
    registeredNameResult,
    registerNameRef,
    formErrors,
    submitHandler,
  };
};
