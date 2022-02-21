import { waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { render } from "features/common/utils/test-utils";
import { ToastContainer } from "features/toast/components/ToastContainer";
import { server } from "mocks/test/server";
import {
  serverErrorForUnregisterResponse,
  successToUnregisterResponse,
} from "mocks/test/user.mock";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { UnregisterAccountModal } from "../UnregisterAccountModal";

describe("UnregisterAccountModal", () => {
  function renderDeleteAccountModal() {
    const onClose = jest.fn();
    const Component = (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <UnregisterAccountModal onClose={onClose} isOpen={true} />
                <ToastContainer />
                <Outlet />
              </>
            }
          >
            <Route path="login" element={<div>Login Page</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, findByRole, getByText } = render(Component, {
      preloadedState: {
        user: {
          user: {
            id: 1,
            email: "tester@gmail.com",
            nickname: "tester",
          },
          accessToken: "accesstoken",
          refreshToken: "refreshtoken",
        },
      },
    });

    return {
      onClose,
      getByRole,
      findByRole,
      getByText,
    };
  }

  afterEach(() => {
    server.resetHandlers();
  });

  it("`회원 탈퇴` 타이틀과 안내글, `탈퇴하기`, `취소` 버튼을 렌더링한다.", () => {
    const { getByRole, getByText } = renderDeleteAccountModal();

    const title = getByRole("heading", { name: "회원 탈퇴" });
    const paragraph = getByText(/회원 탈퇴하시겠습니까?/g);
    const deleteAccountButton = getByRole("button", { name: "탈퇴하기" });
    const cancelButton = getByRole("button", { name: "취소" });

    expect(title).toBeInTheDocument();
    expect(paragraph).toBeInTheDocument();
    expect(deleteAccountButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  it("`회원 탈퇴` 버튼을 눌러 회원 탈퇴에 성공하면 `onClose` prop이 호출되고, `/login` url로 이동한다.", async () => {
    // given
    server.use(successToUnregisterResponse);
    const { onClose, getByRole } = renderDeleteAccountModal();
    const deleteAccountButton = getByRole("button", { name: "탈퇴하기" });

    // when
    userEvent.click(deleteAccountButton);

    // then
    await waitFor(() => {
      expect(onClose).toBeCalled();
      expect(window.location.pathname).toBe("/login");
    });
  });

  it("`취소` 버튼을 누르면 `onClose` prop이 호출된다.", () => {
    // given
    const { onClose, getByRole } = renderDeleteAccountModal();
    const cancelButton = getByRole("button", { name: "취소" });

    // when
    userEvent.click(cancelButton);

    // then
    expect(onClose).toBeCalled();
  });

  it("`회원 탈퇴` 버튼을 눌렀을 때, 서버 측 에러로 인해 회원 탈퇴에 실패한 경우 에러 메시지를 보여준다.", async () => {
    // given
    server.use(serverErrorForUnregisterResponse);
    const { onClose, getByRole, findByRole } = renderDeleteAccountModal();
    const deleteAccountButton = getByRole("button", { name: "탈퇴하기" });

    // when
    userEvent.click(deleteAccountButton);

    // then
    const errorMessage = await findByRole("alert");
    expect(errorMessage).toHaveTextContent(
      "서버 측 에러로 인해 회원탈퇴에 실패했습니다. 잠시 후에 다시 시도해주세요."
    );
    expect(onClose).not.toBeCalled();
  });
});
