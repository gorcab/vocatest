import userEvent from "@testing-library/user-event";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { render, within } from "features/common/utils/test-utils";
import { ToastContainer } from "features/toast/components/ToastContainer";
import { VocabularyListCardDropdownMenu } from "../VocabularyListCardDropdownMenu";

describe("VocabularyListCardDropdownMenu", () => {
  function renderVocabularyListCardDropdownMenu() {
    const vocabularyListCardDropdownMenuProps = {
      vocabularyListId: 1,
      vocabularyListTitle: "토익 DAY-10",
    };
    const Component = (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <VocabularyListCardDropdownMenu
                  {...vocabularyListCardDropdownMenuProps}
                />
                <ToastContainer />
                <Outlet />
              </>
            }
          >
            <Route
              path="edit-vocabulary/:vocabularyListId"
              element={<div>단어장 수정 페이지</div>}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, findByRole } = render(Component);

    return {
      ...vocabularyListCardDropdownMenuProps,
      getByRole,
      findByRole,
    };
  }
  it("최초에는 메뉴를 열 수 있는 버튼만 렌더링된다.", () => {
    const { getByRole } = renderVocabularyListCardDropdownMenu();

    const openButton = getByRole("button", { name: "단어장 관련 메뉴" });

    expect(openButton).toBeInTheDocument();
  });

  it("`단어장 관련 메뉴` 아이콘 버튼을 클릭하면 메뉴를 렌더링한다.", async () => {
    const { getByRole, findByRole } = renderVocabularyListCardDropdownMenu();

    const openButton = getByRole("button", { name: "단어장 관련 메뉴" });
    userEvent.click(openButton);

    const menu = await findByRole("menu");
    const menuItems = within(menu).getAllByRole("menuitem");

    expect(menuItems).toHaveLength(2);
    expect(menuItems[0]).toHaveTextContent("단어장 삭제");
    expect(menuItems[1]).toHaveTextContent("단어장 수정");
  });

  it("`단어장 삭제` 버튼을 클릭하면 DeleteVocabularyListModal 컴포넌트를 띄운다.", async () => {
    // given
    const { getByRole, findByRole } = renderVocabularyListCardDropdownMenu();

    const openButton = getByRole("button", { name: "단어장 관련 메뉴" });
    userEvent.click(openButton);

    const deleteVocabularyListMenu = getByRole("menuitem", {
      name: "단어장 삭제",
    });

    // when
    userEvent.click(deleteVocabularyListMenu);

    // then
    const deleteVocabularyListModal = await findByRole("dialog");
    expect(deleteVocabularyListModal).toBeInTheDocument();
  });

  it("`단어장 수정` 버튼을 클릭하면 `/edit-vocabulary/${vocabularyListId}` url로 이동한다.", async () => {
    // given
    window.history.replaceState({}, "", "/");
    const { getByRole, vocabularyListId } =
      renderVocabularyListCardDropdownMenu();

    const openButton = getByRole("button", { name: "단어장 관련 메뉴" });
    userEvent.click(openButton);

    const editVocabularyListMenu = getByRole("menuitem", {
      name: "단어장 수정",
    });

    // when
    userEvent.click(editVocabularyListMenu);

    // then
    expect(window.location.pathname).toBe(
      `/edit-vocabulary/${vocabularyListId}`
    );
  });
});
