import userEvent from "@testing-library/user-event";
import { render, waitFor } from "features/common/utils/test-utils";
import { ToastContainer } from "features/toast/components/ToastContainer";
import {
  existedCategoryNameForCreatingCategoryResponse,
  serverErrorForCreatingCategoryResponse,
  successCreatingCategoryResponse,
} from "mocks/test/category.mock";
import { server } from "mocks/test/server";
import { CreateCategoryFormModal } from "../CreateCategoryFormModal";

describe("CreateCategoryFormModal", () => {
  function renderCreateCategoryFormModal() {
    const modalCloseHandler = jest.fn();
    const { getByRole, findByRole, getByLabelText } = render(
      <>
        <CreateCategoryFormModal
          isOpen={true}
          modalCloseHandler={modalCloseHandler}
        />
        <ToastContainer />
      </>
    );

    return {
      modalCloseHandler,
      getByLabelText,
      getByRole,
      findByRole,
    };
  }

  afterEach(() => {
    server.resetHandlers();
  });

  it("`카테고리명` 필드와 `생성하기` 버튼, `닫기` 버튼을 렌더링한다.", () => {
    const { getByLabelText, getByRole } = renderCreateCategoryFormModal();

    const categoryNameField = getByLabelText("카테고리명");
    const createButton = getByRole("button", { name: "생성하기" });
    const closeButton = getByRole("button", { name: "닫기" });

    expect(categoryNameField).toBeInTheDocument();
    expect(createButton).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
  });

  it("`닫기` 버튼을 클릭하면 `modalCloseHandler` 함수가 호출된다.", () => {
    const { getByRole, modalCloseHandler } = renderCreateCategoryFormModal();
    const closeButton = getByRole("button", { name: "닫기" });

    userEvent.click(closeButton);

    expect(modalCloseHandler).toBeCalled();
  });

  it("이미 존재하는 카테고리명을 추가하면 `이미 존재하는 카테고리명입니다.` 에러 메시지를 띄운다.", async () => {
    server.use(existedCategoryNameForCreatingCategoryResponse);
    const { getByRole, findByRole, getByLabelText } =
      renderCreateCategoryFormModal();
    const categoryNameField = getByLabelText("카테고리명");
    const createButton = getByRole("button", { name: "생성하기" });

    userEvent.type(categoryNameField, "토익");
    userEvent.click(createButton);

    const errorMessage = await findByRole("alert");

    expect(errorMessage).toHaveTextContent("이미 존재하는 카테고리명입니다.");
  });

  it("서버 측 에러로 인해 카테고리 생성에 실패하면 서버 측으로부터 받은 에러 메시지를 띄운다.", async () => {
    server.use(serverErrorForCreatingCategoryResponse);
    const { getByRole, findByRole, getByLabelText } =
      renderCreateCategoryFormModal();
    const categoryNameField = getByLabelText("카테고리명");
    const createButton = getByRole("button", { name: "생성하기" });

    userEvent.type(categoryNameField, "토익");
    userEvent.click(createButton);

    const errorMessage = await findByRole("alert");

    expect(errorMessage).toHaveTextContent(
      "서버 측 에러로 인해 카테고리 생성에 실패했습니다. 잠시 후에 다시 시도해주세요."
    );
  });

  it("카테고리 생성에 성공하면 `modalCloseHandler` 함수가 호출된다.", async () => {
    server.use(successCreatingCategoryResponse);
    const { getByRole, getByLabelText, modalCloseHandler } =
      renderCreateCategoryFormModal();
    const categoryNameField = getByLabelText("카테고리명");
    const createButton = getByRole("button", { name: "생성하기" });

    userEvent.type(categoryNameField, "아이엘츠");
    userEvent.click(createButton);

    await waitFor(
      () => {
        expect(modalCloseHandler).toBeCalled();
      },
      { timeout: 2000 }
    );
  });
});
