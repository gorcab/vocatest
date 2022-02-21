import { useDeleteUserMutation } from "features/api/slice";
import { Modal } from "features/common/components/Modal";
import { Spinner } from "features/common/components/Spinner";
import { useAuth } from "features/common/hooks/useAuth";
import { is4XXError, is5XXError } from "features/common/utils/helper";
import { useToast } from "features/toast/hooks/useToast";
import { User } from "features/user/slice";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

type UnregisterAccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const UnregisterAccountModal: React.FC<UnregisterAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const { id } = useAuth() as User;
  const navigate = useNavigate();
  const toast = useToast();
  const [deleteUser, { isLoading, isSuccess, reset, error }] =
    useDeleteUserMutation();

  const deleteButtonHandler = () => {
    deleteUser(id);
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      onClose();
      navigate("/login");
    } else if (is4XXError(error) || is5XXError(error)) {
      reset();
      toast({
        type: "ERROR",
        desc: "서버 측 에러로 인해 회원탈퇴에 실패했습니다. 잠시 후에 다시 시도해주세요.",
      });
    }
  }, [isSuccess, error, toast, reset, navigate, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      initialFocusRef={deleteButtonRef}
      backgroundColorclassName="bg-white"
      title="회원 탈퇴"
    >
      <p className="mb-5">회원 탈퇴하시겠습니까?</p>
      <div className="flex flex-row-reverse text-white">
        <button
          ref={deleteButtonRef}
          disabled={isLoading}
          onClick={deleteButtonHandler}
          type="button"
          className="ml-5 rounded-sm bg-red-500 hover:bg-red-500/80 disabled:bg-red-500/80 outline-red-500 focus:outline focus:outline-offset-2 focus:outline-2 py-1 px-3 w-20 flex justify-center"
        >
          {isLoading ? (
            <Spinner thickness={2} gap={2} color="white" size={25} />
          ) : (
            "탈퇴하기"
          )}
        </button>
        <button
          onClick={onClose}
          type="button"
          className="rounded-sm bg-gray-400 hover:bg-gray-400/80 outline-gray-400 focus:outline focus:outline-offset-2 focus:outline-2 py-1 px-3 w-20 flex justify-center"
        >
          취소
        </button>
      </div>
    </Modal>
  );
};
