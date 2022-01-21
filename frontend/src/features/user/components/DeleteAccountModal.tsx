import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useDeleteUserMutation } from "../../api/slice";
import { Modal } from "../../common/components/Modal";
import { Spinner } from "../../common/components/Spinner";
import { useAuth } from "../../common/hooks/useAuth";
import { is4XXError, is5XXError } from "../../common/utils/helper";
import { useToast } from "../../toast/hooks/useToast";
import { User } from "../slice";

type DeleteAccoountModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const DeleteAccountModal: React.FC<DeleteAccoountModalProps> = ({
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
        desc:
          error.data.message ||
          "회원 탈퇴에 실패했습니다. 잠시 후에 다시 시도해주세요.",
      });
    }
  }, [isSuccess, error, toast, reset, navigate]);

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
          type="button"
          className="rounded-sm bg-gray-400 hover:bg-gray-400/80 outline-gray-400 focus:outline focus:outline-offset-2 focus:outline-2 py-1 px-3 w-20 flex justify-center"
        >
          취소
        </button>
      </div>
    </Modal>
  );
};
