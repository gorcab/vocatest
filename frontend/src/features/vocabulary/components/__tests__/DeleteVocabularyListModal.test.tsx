import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { server } from "../../../../mocks/server";
import { render, waitFor } from "../../../common/utils/test-utils";
import { ToastContainer } from "../../../toast/components/ToastContainer";
import { DeleteVocabularyListModal } from "../DeleteVocabularyListModal";

describe("DeleteVocabularyListModal", () => {
  function renderDeleteVocabularyListModal() {
    window.history.replaceState({}, "", "/");
    const portal = document.createElement("div");
    portal.classList.add("portal");
    const isOpen = true;
    const title = "토익 DAY-10";
    const vocabularyListId = 1;
    const onClose = jest.fn();

    const Component = (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <ToastContainer />
                <Outlet />
              </>
            }
          >
            <Route
              index
              element={
                <DeleteVocabularyListModal
                  isOpen={isOpen}
                  title={title}
                  vocabularyListId={vocabularyListId}
                  onClose={onClose}
                />
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, getByText, findByRole } = render(Component, {
      container: document.body.appendChild(portal),
    });

    return {
      title,
      onClose,
      vocabularyListId,
      getByRole,
      findByRole,
      getByText,
    };
  }

  afterEach(() => {
    server.resetHandlers();
  });

  it("단어장 삭제를 알리는 글과 `삭제하기`, `취소`, 닫기 아이콘 버튼을 렌더링한다.", () => {
    const { getByRole, getByText, title } = renderDeleteVocabularyListModal();

    const deleteTitle = getByRole("heading", { name: "단어장 삭제" });
    const deleteParagraph = getByText(
      new RegExp(`${title} 단어장을 정말로 삭제하시겠습니까?`, "g")
    );
    const closeIconButton = getByRole("button", { name: "닫기" });
    const deleteButton = getByRole("button", { name: "삭제하기" });
    const cancelButton = getByRole("button", { name: "취소" });

    expect(deleteTitle).toBeInTheDocument();
    expect(deleteParagraph).toBeInTheDocument();
    expect(closeIconButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  it("닫기 아이콘 버튼을 누르면 onClose 함수가 호출된다.", async () => {
    const { getByRole, onClose } = renderDeleteVocabularyListModal();
    const closeIconButton = getByRole("button", { name: "닫기" });

    userEvent.click(closeIconButton);

    expect(onClose).toBeCalled();
  });

  it("`취소`버튼을 누르면 onClose 함수가 호출된다.", async () => {
    const { getByRole, onClose } = renderDeleteVocabularyListModal();
    const cancelButton = getByRole("button", { name: "취소" });

    userEvent.click(cancelButton);

    expect(onClose).toBeCalled();
  });

  it("단어장 삭제에 성공하면 onClose 함수가 호출된다.", async () => {
    // given
    server.use(
      rest.delete(
        `${process.env.REACT_APP_API_URL}/vocabularies/:id`,
        (req, res, ctx) => {
          return res(ctx.status(201));
        }
      )
    );
    const { getByRole, onClose } = renderDeleteVocabularyListModal();
    const deleteButton = getByRole("button", { name: "삭제하기" });

    // when
    userEvent.click(deleteButton);

    // then
    await waitFor(() => {
      expect(onClose).toBeCalled();
    });
  });

  it("단어장 삭제에 실패하면 `단어장 삭제에 실패했습니다. 잠시 후에 다시 시도해주세요.` 에러 메시지를 띄운다.", async () => {
    server.use(
      rest.delete(
        `${process.env.REACT_APP_API_URL}/vocabularies/:id`,
        (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              status: 500,
              message: "Internal Server Error",
            })
          );
        }
      )
    );
    const { getByRole, findByRole, onClose } =
      renderDeleteVocabularyListModal();
    const deleteButton = getByRole("button", { name: "삭제하기" });

    userEvent.click(deleteButton);

    const errorMesssage = await findByRole("alert");

    expect(errorMesssage).toHaveTextContent(
      "단어장 삭제에 실패했습니다. 잠시 후에 다시 시도해주세요."
    );
    expect(onClose).not.toBeCalled();
  });
});