import userEvent from "@testing-library/user-event";
import { render, waitFor } from "features/common/utils/test-utils";
import { ToastContainer } from "features/toast/components/ToastContainer";
import { UserState } from "features/user/slice";
import { server } from "mocks/test/server";
import {
  failToEditProfileResponse,
  networkConnectionFailForEditProfileResponse,
  successToEditProfileResponse,
  successToGetUserProfileResponse,
} from "mocks/test/user.mock";
import { EditUserProfilePage } from "pages/EditUserProfilePage";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

describe("EditUserProfilePage", () => {
  function renderEditProfilePage(isUserInStore: boolean = true) {
    window.history.replaceState({}, "", "/profile");
    const Component = (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Outlet />}>
            <Route
              path="profile"
              element={
                <>
                  <EditUserProfilePage />
                  <ToastContainer />
                </>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, findByRole, getByLabelText } = render(
      Component,
      isUserInStore
        ? {
            preloadedState: {
              user: {
                user: {
                  id: 1,
                  email: "tester@gmail.com",
                  nickname: "tester",
                },
                accessToken: "accesstoken",
                refreshToken: "refreshtoken",
              } as UserState,
            },
          }
        : undefined
    );

    return {
      getByRole,
      findByRole,
      getByLabelText,
    };
  }

  beforeEach(() => {
    server.use(...[successToGetUserProfileResponse]);
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe("전역 스토어에 사용자 정보가 없다면", () => {
    it("`/` url로 이동한다.", () => {
      renderEditProfilePage(false);

      expect(window.location.pathname).toBe("/");
    });
  });

  describe("전역 스토어에 사용자 정보가 있다면", () => {
    it("`내 프로필` 타이틀과 프로필 수정 폼을 렌더링한다.", () => {
      const { getByRole } = renderEditProfilePage();

      const title = getByRole("heading", { name: "내 프로필" });
      const editProfileForm = getByRole("form", { name: "프로필 수정 폼" });

      expect(title).toBeInTheDocument();
      expect(editProfileForm).toBeInTheDocument();
    });

    it("프로필 수정 폼을 입력한 뒤 `변경하기` 버튼을 눌러 프로필 변경에 성공하면 `/` url로 이동한다.", async () => {
      server.use(successToEditProfileResponse);
      const { getByLabelText, getByRole } = renderEditProfilePage();
      expect(window.location.pathname).toBe("/profile");

      const passwordField = getByLabelText("비밀번호");
      const newPasswordField = getByLabelText("새 비밀번호");
      const newPasswordConfirmField = getByLabelText("새 비밀번호 확인");
      const newNicknameField = getByLabelText("닉네임");
      const submitButton = getByRole("button", { name: "변경하기" });

      userEvent.type(passwordField, "password");
      userEvent.type(newPasswordField, "newpassword1");
      userEvent.type(newPasswordConfirmField, "newpassword1");
      userEvent.clear(newNicknameField);
      userEvent.type(newNicknameField, "newtester");
      userEvent.click(submitButton);

      await waitFor(() => {
        expect(window.location.pathname).toBe("/");
      });
    });

    it("프로필 수정에 실패한 경우 서버 측으로부터 받은 메시지를 Toast로 보여준다.", async () => {
      server.use(failToEditProfileResponse);

      const { getByLabelText, findByRole, getByRole } = renderEditProfilePage();
      expect(window.location.pathname).toBe("/profile");

      const passwordField = getByLabelText("비밀번호");
      const newPasswordField = getByLabelText("새 비밀번호");
      const newPasswordConfirmField = getByLabelText("새 비밀번호 확인");
      const newNicknameField = getByLabelText("닉네임");
      const submitButton = getByRole("button", { name: "변경하기" });

      userEvent.type(passwordField, "password");
      userEvent.type(newPasswordField, "newpassword1");
      userEvent.type(newPasswordConfirmField, "newpassword1");
      userEvent.clear(newNicknameField);
      userEvent.type(newNicknameField, "newtester");
      userEvent.click(submitButton);

      const alertMessage = await findByRole("alert");
      expect(alertMessage).toHaveTextContent("비밀번호가 올바르지 않습니다.");
    });

    it("네트워크 연결 에러로 인해 프로필 수정에 실패한 경우 `서버 측 에러로 인해 프로필 변경에 실패했습니다. 잠시 후에 다시 시도해주세요.` Toast로 보여준다.", async () => {
      server.use(networkConnectionFailForEditProfileResponse);

      const { getByLabelText, findByRole, getByRole } = renderEditProfilePage();
      expect(window.location.pathname).toBe("/profile");

      const passwordField = getByLabelText("비밀번호");
      const newPasswordField = getByLabelText("새 비밀번호");
      const newPasswordConfirmField = getByLabelText("새 비밀번호 확인");
      const newNicknameField = getByLabelText("닉네임");
      const submitButton = getByRole("button", { name: "변경하기" });

      userEvent.type(passwordField, "password");
      userEvent.type(newPasswordField, "newpassword1");
      userEvent.type(newPasswordConfirmField, "newpassword1");
      userEvent.clear(newNicknameField);
      userEvent.type(newNicknameField, "newtester");
      userEvent.click(submitButton);

      const alertMessage = await findByRole("alert");
      expect(alertMessage).toHaveTextContent(
        "서버 측 에러로 인해 프로필 변경에 실패했습니다. 잠시 후에 다시 시도해주세요."
      );
    });
  });
});
