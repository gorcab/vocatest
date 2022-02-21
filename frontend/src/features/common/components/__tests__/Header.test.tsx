import userEvent from "@testing-library/user-event";
import { render } from "features/common/utils/test-utils";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { Header } from "../Header";

describe("Header", () => {
  function renderHeader() {
    window.history.replaceState({}, "", "/");
    const showSidebar = false;
    const handleSidebarButton = jest.fn();

    const Component = (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header
                  showSidebarOnMobile={showSidebar}
                  handleSidebarButton={handleSidebarButton}
                />
                <Outlet />
              </>
            }
          >
            <Route path="login" element={<div>Login</div>} />
            <Route path="profile" element={<div>Profile</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, findByPlaceholderText, queryByRole, findByRole, debug } =
      render(Component, {
        preloadedState: {
          user: {
            user: {
              id: 1,
              email: "tester@gmail.com",
              nickname: "tester",
            },
            accessToken: "accessToken",
            refreshToken: "refreshToken",
          },
        },
      });

    return { getByRole, queryByRole, findByPlaceholderText, findByRole, debug };
  }
  it("텍스트 로고 링크, 카테고리 메뉴 토글 버튼, 단어장 검색 버튼, 유저 아이콘 버튼을 렌더링한다.", () => {
    // given
    const { getByRole } = renderHeader();

    const textLogo = getByRole("link", { name: "VOCATEST" });
    const showSearchFieldButton = getByRole("button", { name: "단어장 검색" });
    const categoryMenuToggleButton = getByRole("button", {
      name: "카테고리 메뉴 열기",
    });
    const userIconButton = getByRole("button", {
      name: "회원 관련 메뉴",
    });

    // then
    expect(textLogo).toBeInTheDocument();
    expect(showSearchFieldButton).toBeInTheDocument();
    expect(categoryMenuToggleButton).toBeInTheDocument();
    expect(userIconButton).toBeInTheDocument();
  });

  it('텍스트 로고 링크를 클릭하면 "/" url로 이동한다.', async () => {
    // given
    window.history.replaceState({}, "", "/vocabularies");
    const { getByRole } = renderHeader();
    const textLogo = getByRole("link", { name: "VOCATEST" });

    // when
    userEvent.click(textLogo);

    // then
    expect(window.location.pathname).toBe("/");
  });

  it("단어장 검색 버튼을 클릭하면 단어장 검색 폼 Modal이 나타난다.", async () => {
    // given
    const { getByRole, findByPlaceholderText } = renderHeader();
    const showSearchFieldButton = getByRole("button", { name: "단어장 검색" });

    // when
    userEvent.click(showSearchFieldButton);

    // then
    expect(
      await findByPlaceholderText("단어장명을 입력해주세요.")
    ).toBeInTheDocument();
  });

  it("유저 아이콘 버튼을 클릭하면 회원 관련 메뉴가 나타난다.", async () => {
    // given
    const { getByRole, queryByRole, findByRole } = renderHeader();
    const userIconButton = getByRole("button", {
      name: "회원 관련 메뉴",
    });
    expect(queryByRole("menu")).not.toBeInTheDocument();

    // when
    userEvent.click(userIconButton);

    // then
    expect(queryByRole("menu")).toBeInTheDocument();
  });
});
