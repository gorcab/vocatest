import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useCreateCategoryMutation } from "../../api/slice";
import { CreateCategoryRequest, ErrorResponse } from "../../api/types";
import { useToast } from "../../toast/hooks/useToast";

type CreateCategoryDto = CreateCategoryRequest;

export const useCreateCategoryForm = (
  isOpen: boolean,
  modalCloseHandler: () => void
) => {
  const [createCategory, mutationResult] = useCreateCategoryMutation();
  const {
    isLoading: isCreateCategoryLoading,
    error,
    isSuccess,
    reset: mutationReset,
  } = mutationResult;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: formReset,
    setError,
  } = useForm<CreateCategoryDto>();
  const toast = useToast();

  const categoryNameFieldRef = useRef<HTMLInputElement | null>(null);
  const registerResult = register("name", {
    required: "카테고리명을 입력해주세요.",
    validate: {
      whiteSpaceCategoryName: (value) =>
        value.trim() !== "" ||
        "공백으로 구성된 카테고리명은 사용할 수 없습니다.",
    },
  });
  const { ref } = registerResult;

  const registerRef = (inputElement: HTMLInputElement | null) => {
    ref(inputElement);
    categoryNameFieldRef.current = inputElement;
  };

  const submitHandler = handleSubmit((dto) => {
    mutationReset();
    createCategory(dto);
  });

  useEffect(() => {
    if (categoryNameFieldRef.current && isOpen) {
      categoryNameFieldRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isSuccess) {
      mutationReset();
      formReset();
      modalCloseHandler();
    } else if (error && "status" in error) {
      const message = (error.data as ErrorResponse).message;
      if (
        error.status >= 400 &&
        error.status < 500 &&
        /카테고리명/.test(message)
      ) {
        setError("name", {
          type: "manual",
          message,
        });
      } else {
        toast({
          type: "ERROR",
          desc: "카테고리 생성에 실패했습니다. 잠시 후에 다시 시도해주세요.",
        });
      }
    }
  }, [
    error,
    setError,
    toast,
    isSuccess,
    modalCloseHandler,
    formReset,
    mutationReset,
  ]);

  return {
    mutationResult,
    submitHandler,
    registerRef,
    errors,
    isCreateCategoryLoading,
    registerResult,
  };
};
