import { useCreateCategoryForm } from "features/category/hooks/useCreateCategoryForm";
import { BasicForm } from "features/common/components/BasicForm";
import { InputErrorMessage } from "features/common/components/InputErrorMessage";
import { InputGroup } from "features/common/components/InputGroup";
import { Label } from "features/common/components/Label";
import { Modal } from "features/common/components/Modal";
import { Spinner } from "features/common/components/Spinner";

type CreateCategoryFormModalProps = {
  isOpen: boolean;
  modalCloseHandler: () => void;
};

export const CreateCategoryFormModal: React.FC<CreateCategoryFormModalProps> =
  ({ isOpen, modalCloseHandler }) => {
    const {
      submitHandler,
      registerRef,
      categoryNameFieldRef,
      errors,
      isCreateCategoryLoading,
      registerResult: { ref, ...rest },
    } = useCreateCategoryForm(isOpen, modalCloseHandler);

    return (
      <Modal
        onClose={modalCloseHandler}
        isOpen={isOpen}
        title="카테고리 생성하기"
        initialFocusRef={categoryNameFieldRef}
        backgroundColorclassName="bg-white"
      >
        <BasicForm formLabel="카테고리 생성 폼" onSubmit={submitHandler}>
          <Label label="카테고리명" name="name" />
          <InputGroup>
            <input
              type="text"
              id="name"
              className="w-full border rounded mb-2 p-1 flex items-center"
              {...rest}
              ref={registerRef}
            />
            {errors.name && (
              <InputErrorMessage as="div">
                {errors.name.message}
              </InputErrorMessage>
            )}
          </InputGroup>
          <div className="flex justify-end items-center">
            <button
              type="submit"
              disabled={isCreateCategoryLoading}
              className="bg-blue-500 disabled:bg-blue-500/80 hover:bg-blue-500/80 py-1 px-3 w-20 flex justify-center items-center text-white rounded focus:outline focus:outline-offset-2 focus:outline-2"
            >
              {isCreateCategoryLoading ? (
                <Spinner thickness={2} gap={2} color="white" size={25} />
              ) : (
                "생성하기"
              )}
            </button>
          </div>
        </BasicForm>
      </Modal>
    );
  };
