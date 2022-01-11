import userEvent from "@testing-library/user-event";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { localStorageMock } from "../../../../mocks/storageMocks";
import { DEFAULT_PER_PAGE } from "../../utils/constants";
import { render } from "../../utils/test-utils";
import { Header } from "../Header";

describe("Header", () => {
  function renderHeader() {
    window.history.replaceState({}, "", "/");
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
});
