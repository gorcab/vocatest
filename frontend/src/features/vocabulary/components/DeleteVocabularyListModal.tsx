import { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { useDeleteVocabularyListMutation } from "../../api/slice";
import { Modal } from "../../common/components/Modal";
import { Spinner } from "../../common/components/Spinner";
import { useToast } from "../../toast/hooks/useToast";

type DeleteVocabularyListModalProps = {
  isOpen: boolean;
  title: string;
  vocabularyListId: number;
  onClose: () => void;
};

export const DeleteVocabularyListModal: React.FC<DeleteVocabularyListModalProps> =
  ({ isOpen, title, vocabularyListId, onClose }) => {
    const toast = useToast();
    const [deleteVocabularyList, { isLoading, error, isSuccess, reset }] =
      useDeleteVocabularyListMutation();
    const deleteButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      if (deleteButtonRef.current && isOpen) {
        deleteButtonRef.current.focus();
      }
    }, [isOpen]);

    useEffect(() => {
      if (isSuccess) {
        onClose();
      } else if (error) {
        reset();
        toast({
          type: "ERROR",
          desc: "단어장 삭제에 실패했습니다. 잠시 후에 다시 시도해주세요.",
        });
      }
    }, [isSuccess, reset, onClose, error, toast]);

    const deleteHandler = () => {
      deleteVocabularyList(vocabularyListId);
    };

    return (
      <Modal onClose={onClose} isOpen={isOpen}>
        <div className="absolute top-1/2 inset-x-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 md:w-1/3 p-5 z-100 rounded-sm bg-white">
          <h1 className="font-bold text-lg mb-3">단어장 삭제</h1>
          <button
            type="button"
            className="absolute top-2 right-2 hover:text-black/70"
            onClick={onClose}
          >
            <FaTimes className="w-[25px] h-[25px]" />
            <span className="sr-only">닫기</span>
          </button>
          <p className="mb-5">{title} 단어장을 정말로 삭제하시겠습니까?</p>
          <div className="flex flex-row-reverse">
            <button
              type="button"
              ref={deleteButtonRef}
              onClick={deleteHandler}
              className="ml-5 rounded-sm bg-red-500 hover:bg-red-500/80 outline-red-500 focus:outline focus:outline-offset-2 focus:outline-2 py-1 px-3 w-20 flex justify-center text-white"
            >
              {isLoading ? (
                <Spinner thickness={2} gap={2} color="White" size={25} />
              ) : (
                "삭제하기"
              )}
            </button>
            <button
              type="button"
              className="rounded-sm bg-gray-400 hover:bg-gray-400/80 outline-gray-400 focus:outline focus:outline-offset-2 focus:outline-2 py-1 px-3 w-20 flex justify-center text-white"
              onClick={onClose}
            >
              취소
            </button>
          </div>
        </div>
      </Modal>
    );
  };
