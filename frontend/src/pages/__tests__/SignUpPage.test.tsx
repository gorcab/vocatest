import userEvent from "@testing-library/user-event";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { render } from "../../features/common/utils/test-utils";
import { SignUpPage } from "../SignUpPage";

describe("SignUpPage", () => {
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
        <Route path="sign-up" element={<SignUpPage />} />
      </Routes>
    </BrowserRouter>
  );

  beforeEach(() => {
    window.history.replaceState({}, "", "/sign-up");
  });

  it("로고와 회원가입 폼을 렌더링한다.", () => {
    const { getByRole } = render(Component);

    const textLogo = getByRole("heading", { name: "VOCATEST" });
    const signUpForm = getByRole("form");

    expect(textLogo).toBeInTheDocument();
    expect(signUpForm).toBeInTheDocument();
  });
});
