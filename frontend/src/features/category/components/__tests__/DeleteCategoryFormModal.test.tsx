import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { server } from "../../../../mocks/server";
import { CategoryDto } from "../../../api/types";
import {
  render,
  waitFor,
  waitForElementToBeRemoved,
} from "../../../common/utils/test-utils";
import { ToastContainer } from "../../../toast/components/ToastContainer";
import { DeleteCategoryFormModal } from "../DeleteCategoryFormModal";

describe("DeleteCategoryFormModal", () => {
  function renderDeleteCategoryFormModal() {
    const category: CategoryDto = {
      id: 1,
      name: "토익",
    };
    const onClose = jest.fn();
    const Component = (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <DeleteCategoryFormModal
                  isOpen={true}
                  category={category}
                  onClose={onClose}
                />
                <ToastContainer />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, getByText } = render(Component);

    return {
      category,
      onClose,
      getByRole,
      getByText,
    };
  }

  afterEach(() => {
    server.resetHandlers();
  });

  it("`카테고리 삭제` heading과  닫기 아이콘 버튼, 안내글, `삭제하기`, `취소` 버튼을 렌더링한다.", () => {
    const { getByRole, getByText } = renderDeleteCategoryFormModal();

    const heading = getByRole("heading", { name: "카테고리 삭제" });
    const closeButton = getByRole("button", { name: "닫기" });
    const paragraph = getByText(/카테고리를 삭제하시겠습니까?/g);
    const deleteButton = getByRole("button", { name: "삭제하기" });
    const cancelButton = getByRole("button", { name: "취소" });

    expect(heading).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
    expect(paragraph).toHaveTextContent("카테고리를 삭제하시겠습니까?");
    expect(deleteButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  it("`취소` 버튼을 누르면 Modal이 닫힌다.", () => {
    const { onClose, getByRole } = renderDeleteCategoryFormModal();

    const cancelButton = getByRole("button", { name: "취소" });

    userEvent.click(cancelButton);

    expect(onClose).toBeCalled();
  });

  it("`삭제하기` 버튼을 클릭하면 서버 측에 카테고리 삭제를 요청하고 삭제가 완료되면 Modal을 닫은 뒤, `/` url로 redirect한다.", async () => {
    window.history.replaceState({}, "", "/?page=1&perPage=12&category=1");
    server.use(
      rest.delete(
        `${process.env.REACT_APP_API_URL}/categories/:id`,
        (req, res, ctx) => {
          return res(ctx.status(201));
        }
      )
    );
    const { onClose, getByRole } = renderDeleteCategoryFormModal();

    const deleteButton = getByRole("button", { name: "삭제하기" });

    userEvent.click(deleteButton);

    await waitForElementToBeRemoved(document.querySelector(".animate-spin"));

    await waitFor(() => {
      expect(onClose).toBeCalled();
      expect(window.location.pathname + window.location.search).toBe("/");
    });
  });

  it("서버 측 에러로 인해 카테고리 삭제에 실패하면 서버 측 에러 메시지를 띄운다.", async () => {
    const message = "올바르지 않은 카테고리입니다.";
    server.use(
      rest.delete(
        `${process.env.REACT_APP_API_URL}/categories/:id`,
        (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({
              status: 401,
              message,
            })
          );
        }
      )
    );
    const { onClose, getByRole } = renderDeleteCategoryFormModal();

    const deleteButton = getByRole("button", { name: "삭제하기" });
    userEvent.click(deleteButton);

    await waitForElementToBeRemoved(document.querySelector(".animate-spin"));

    await waitFor(() => {
      expect(onClose).not.toBeCalled();
      expect(getByRole("alert")).toHaveTextContent(message);
    });
  });
});
