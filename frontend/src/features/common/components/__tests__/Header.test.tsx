import userEvent from "@testing-library/user-event";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { localStorageMock } from "../../../../mocks/storageMocks";
import { render } from "../../utils/test-utils";
import { Header } from "../Header";

describe("Header", () => {
  function renderHeader() {
    window.history.replaceState({}, "", "/");
    const headerHeight = 60;
    const showSidebar = false;
    const handleSidebarButton = jest.fn();

    const portal = document.createElement("div");
    portal.classList.add("portal");

    const { getByRole, findByPlaceholderText, findByRole, debug } = render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header
                  height={headerHeight}
                  showSidebarOnMobile={showSidebar}
                  handleSidebarButton={handleSidebarButton}
                />
                <Outlet />
              </>
            }
          >
            <Route path="login" element={<div>Login</div>} />
            <Route path="profile" element={<div>Profile</div>} />
            <Route path="delete-account" element={<div>Delete Account</div>} />
            <Route
              path="vocabularies"
              element={
                <>
                  <Outlet />
                </>
              }
            >
              <Route index element={<div>Vocabularies</div>} />
              <Route path=":id" element={<div>Vocabulary</div>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>,
      {
        container: document.body.appendChild(portal),
      }
    );

    return { getByRole, findByPlaceholderText, findByRole, debug };
  }
  it("텍스트 로고 링크, 카테고리 메뉴 토글 버튼, 단어장 검색 버튼, 회원 관련 메뉴 드롭다운 버튼을 렌더링한다.", () => {
    // given
    const { getByRole } = renderHeader();

    const textLogo = getByRole("link", { name: "VOCATEST" });
    const showSearchFieldButton = getByRole("button", { name: "단어장 검색" });
    const categoryMenuToggleButton = getByRole("button", {
      name: "카테고리 메뉴 열기",
    });
    const dropdownButton = getByRole("button", {
      name: "회원 관련 메뉴",
    });

    // then
    expect(textLogo).toBeInTheDocument();
    expect(showSearchFieldButton).toBeInTheDocument();
    expect(categoryMenuToggleButton).toBeInTheDocument();
    expect(dropdownButton).toBeInTheDocument();
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

  it("단어장 검색 버튼을 클릭하면 단어장 검색 필드가 나타난다.", async () => {
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

  it('단어장 검색 필드에 단어장명을 입력하고 엔터를 누르면 "/vocabularies?title=${title}" url로 이동한다.', async () => {
    // given
    const title = "토익 DAY-8";
    const { getByRole, findByPlaceholderText } = renderHeader();
    const showSearchFieldButton = getByRole("button", { name: "단어장 검색" });
    userEvent.click(showSearchFieldButton);
    const searchField = await findByPlaceholderText("단어장명을 입력해주세요.");

    // when
    userEvent.type(searchField, title);
    userEvent.type(searchField, "{enter}");

    // then
    const { pathname, search } = window.location;

    expect(pathname + search).toBe(`/vocabularies?title=${encodeURI(title)}`);
  });

  it("회원 관련 메뉴 토글 버튼을 누르면 회원 수정, 회원 탈퇴 링크와 로그아웃 버튼이 있는 드롭다운 메뉴가 나타난다.", async () => {
    // given
    const { getByRole, findByRole } = renderHeader();
    const dropdownToggleButton = getByRole("button", {
      name: "회원 관련 메뉴",
    });

    // when
    userEvent.click(dropdownToggleButton);

    // then
    const profileLink = await findByRole("link", { name: "내 프로필" });
    const deleteAccountLink = getByRole("link", { name: "회원 탈퇴" });
    const logoutButton = getByRole("button", { name: "로그아웃" });
    expect(profileLink).toBeInTheDocument();
    expect(deleteAccountLink).toBeInTheDocument();
    expect(logoutButton).toBeInTheDocument();
  });

  it('회원 관련 드롭다운 메뉴에서 내 프로필 링크를 누르면 "/profile" url로 이동한다.', async () => {
    // given
    const { getByRole, findByRole } = renderHeader();
    const dropdownToggleButton = getByRole("button", {
      name: "회원 관련 메뉴",
    });
    userEvent.click(dropdownToggleButton);
    const profileLink = await findByRole("link", { name: "내 프로필" });

    // when
    userEvent.click(profileLink);

    // then
    expect(window.location.pathname).toBe("/profile");
  });

  it('회원 관련 드롭다운 메뉴에서 회원 탈퇴 링크를 누르면 "/delete-account" url로 이동한다.', async () => {
    // given
    const { getByRole, findByRole } = renderHeader();
    const dropdownToggleButton = getByRole("button", {
      name: "회원 관련 메뉴",
    });
    userEvent.click(dropdownToggleButton);
    const deleteAccountLink = await findByRole("link", { name: "회원 탈퇴" });

    // when
    userEvent.click(deleteAccountLink);

    // then
    expect(window.location.pathname).toBe("/delete-account");
  });

  it('회원 관련 드롭다운 메뉴에서 로그아웃 버튼을 누르면 localStorage의 accessToken과 refreshToken을 삭제하고 "/login" url로 이동한다.', async () => {
    // given
    const localStorageSpy = jest.spyOn(localStorageMock, "removeItem");
    const { getByRole, findByRole } = renderHeader();
    const dropdownToggleButton = getByRole("button", {
      name: "회원 관련 메뉴",
    });
    userEvent.click(dropdownToggleButton);
    const logoutButton = await findByRole("button", { name: "로그아웃" });

    // when
    userEvent.click(logoutButton);

    // then
    expect(localStorageSpy).toBeCalledWith("accessToken");
    expect(localStorageSpy).toBeCalledWith("refreshToken");
    expect(window.location.pathname).toBe("/login");
  });
});
