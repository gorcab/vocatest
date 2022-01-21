import { useLayoutEffect, useRef } from "react";
import { CategoryDto } from "../../api/types";
import { Modal } from "../../common/components/Modal";
import { useDeleteCategoryMutation } from "../../api/slice";
import { useToast } from "../../toast/hooks/useToast";
import { useNavigate } from "react-router";
import { is4XXError, is5XXError } from "../../common/utils/helper";
import { Spinner } from "../../common/components/Spinner";

type DeleteCategoryFormModalProps = {
  isOpen: boolean;
  category: CategoryDto;
  onClose: () => void;
};

export const DeleteCategoryFormModal: React.FC<DeleteCategoryFormModalProps> =
  ({ isOpen, category, onClose }) => {
    const toast = useToast();
    const navigate = useNavigate();
    const [deleteCategory, { isLoading, error, isSuccess, reset }] =
      useDeleteCategoryMutation({
        fixedCacheKey: "delete-category",
      });
    const deleteButtonRef = useRef<HTMLButtonElement>(null);

    useLayoutEffect(() => {
      if (isSuccess) {
        onClose();
        navigate("/");
        reset();
      } else if (is4XXError(error) || is5XXError(error)) {
        reset();
        toast({
          type: "ERROR",
          desc:
            error.data.message ||
            "카테고리 삭제에 실패했습니다. 잠시 후에 다시 시도해주세요.",
        });
      }
    }, [isSuccess, reset, onClose, navigate, error, toast]);

    const deleteCategoryHandler = () => {
      deleteCategory(category.id);
    };

    return (
      <Modal
        onClose={onClose}
        isOpen={isOpen}
        initialFocusRef={deleteButtonRef}
        backgroundColorclassName="bg-white"
        title="카테고리 삭제"
      >
        <p className="mb-5">{category.name} 카테고리를 삭제하시겠습니까?</p>
        <div className="flex flex-row-reverse text-white">
          <button
            type="button"
            disabled={isLoading}
            ref={deleteButtonRef}
            onClick={deleteCategoryHandler}
            className="ml-5 rounded-sm bg-red-500 hover:bg-red-500/80 disabled:bg-red-500/80 outline-red-500 focus:outline focus:outline-offset-2 focus:outline-2 py-1 px-3 w-20 flex justify-center"
          >
            {isLoading ? (
              <Spinner thickness={2} gap={2} color="White" size={25} />
            ) : (
              "삭제하기"
            )}
          </button>
          <button
            type="button"
            className="rounded-sm bg-gray-400 hover:bg-gray-400/80 outline-gray-400 focus:outline focus:outline-offset-2 focus:outline-2 py-1 px-3 w-20 flex justify-center"
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </Modal>
    );
  };
