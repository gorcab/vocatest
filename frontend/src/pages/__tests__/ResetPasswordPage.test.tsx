import userEvent from "@testing-library/user-event";
import { server } from "mocks/test/server";
import {
  successResetPasswordResponse,
  successSendingAuthCodeResponse,
} from "mocks/test/user.mock";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import {
  render,
  waitFor,
  waitForElementToBeRemoved,
} from "../../features/common/utils/test-utils";
import { LoginPage } from "../LoginPage";
import { ResetPasswordPage } from "../ResetPasswordPage";

describe("ResetPasswordPage", () => {
  const Component = (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <Outlet />
            </div>
          }
        />
        <Route path="login" element={<LoginPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );

  beforeEach(() => {
    server.use(successSendingAuthCodeResponse);
    window.history.replaceState({}, "", "/reset-password");
  });

  it("로고와 비밀번호 재설정 폼을 렌더링한다.", () => {
    const { getByRole } = render(Component);

    const textLogo = getByRole("heading", { name: "VOCATEST" });
    const signUpForm = getByRole("form");

    expect(textLogo).toBeInTheDocument();
    expect(signUpForm).toBeInTheDocument();
  });

  it('비밀번호 재설정에 성공하면 "/login" url로 이동한다.', async () => {
    // given
    server.use(successResetPasswordResponse);
    const { getByRole, getByLabelText } = render(Component);
    const emailField = getByLabelText("이메일");
    const authCodeRequestButton = getByRole("button", {
      name: "인증 요청",
    });
    const authCodeField = getByLabelText("인증 번호");
    const passwordField = getByLabelText("새 비밀번호");
    const passwordConfirmField = getByLabelText("새 비밀번호 재입력");
    const resetPasswordButton = getByRole("button", {
      name: "비밀번호 재설정",
    });

    // when
    userEvent.type(emailField, "tester@gmail.com");
    userEvent.click(authCodeRequestButton);
    await waitForElementToBeRemoved(document.querySelector("svg.animate-spin"));
    userEvent.type(authCodeField, "123456");
    userEvent.type(passwordField, "test1234");
    userEvent.type(passwordConfirmField, "test1234");
    userEvent.click(resetPasswordButton);

    // then
    await waitFor(() => {
      expect(window.location.pathname).toBe("/login");
    });
  });
});
