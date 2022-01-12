import userEvent from "@testing-library/user-event";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { render, waitFor } from "../../features/common/utils/test-utils";
import { LoginPage } from "../LoginPage";

describe("LoginPage", () => {
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
        >
          <Route index element={<main>MainPage</main>} />
          <Route path="reset-password" element={<div>Reset Password</div>} />
          <Route path="sign-up" element={<div>Sign Up</div>} />
          <Route path="login" element={<LoginPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );

  beforeEach(() => {
    window.history.replaceState({}, "", "/login");
  });

  it("로고와 로그인 폼, 비밀번호 재설정 및 회원가입 링크를 렌더링한다.", () => {
    const { getByRole } = render(Component);

    const textLogo = getByRole("heading", { name: "VOCATEST" });
    const loginForm = getByRole("form");
    const findPasswordLink = getByRole("link", { name: "비밀번호 재설정" });
    const signUpLink = getByRole("link", { name: "회원가입" });

    expect(textLogo).toBeInTheDocument();
    expect(loginForm).toBeInTheDocument();
    expect(findPasswordLink).toBeInTheDocument();
    expect(signUpLink).toBeInTheDocument();
  });

  it('"비밀번호 재설정" 링크를 누르면 "/reset-password" url로 이동한다.', async () => {
    const { getByRole } = render(Component);

    const resetPasswordLink = getByRole("link", { name: "비밀번호 재설정" });

    userEvent.click(resetPasswordLink);

    await waitFor(() => {
      expect(window.location.pathname).toBe("/reset-password");
    });
  });

  it('"회원가입" 링크를 누르면 "/sign-up" url로 이동한다.', async () => {
    const { getByRole } = render(Component);

    const signUpLink = getByRole("link", { name: "회원가입" });

    userEvent.click(signUpLink);

    await waitFor(() => {
      expect(window.location.pathname).toBe("/sign-up");
    });
  });
});
