import { BasicForm } from "../../common/components/BasicForm";
import { InputErrorMessage } from "../../common/components/InputErrorMessage";
import { InputGroup } from "../../common/components/InputGroup";
import { Label } from "../../common/components/Label";
import { Modal } from "../../common/components/Modal";
import { Spinner } from "../../common/components/Spinner";
import { useCreateCategoryForm } from "../hooks/useCreateCategoryForm";

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
        <BasicForm onSubmit={submitHandler}>
          <Label label="카테고리명" name="name"></Label>
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
