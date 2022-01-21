import userEvent from "@testing-library/user-event";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { CategoryDto } from "../../../api/types";
import { render, waitFor, within } from "../../../common/utils/test-utils";
import { CategoryDropdownMenu } from "../CategoryDropdownMenu";

describe("CategoryDropdownMenu", () => {
  function renderCategoryDropdownMenu() {
    const portal = document.createElement("div");
    portal.classList.add("portal");
    const category: CategoryDto = {
      id: 1,
      name: "토익",
    };
    const Component = (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <CategoryDropdownMenu category={category} />
                <Outlet />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    );
    const { getByRole, queryByRole, findByRole } = render(Component, {
      container: document.body.appendChild(portal),
    });

    return {
      getByRole,
      queryByRole,
      findByRole,
    };
  }
  it("최초에는 메뉴를 열 수 있는 버튼만 렌더링된다.", () => {
    const { getByRole, queryByRole } = renderCategoryDropdownMenu();

    const button = getByRole("button", { name: "카테고리 관련 메뉴" });
    const menu = queryByRole("menu");

    expect(button).toBeInTheDocument();
    expect(menu).not.toBeInTheDocument();
  });

  it("버튼을 클릭하면 메뉴를 렌더링한다.", async () => {
    const { getByRole, findByRole } = renderCategoryDropdownMenu();

    const button = getByRole("button", { name: "카테고리 관련 메뉴" });
    userEvent.click(button);

    const menu = await findByRole("menu");
    const menuItems = within(menu).getAllByRole("menuitem");

    expect(menu).toBeInTheDocument();
    expect(menuItems).toHaveLength(2);
    expect(menuItems[0]).toHaveTextContent("카테고리 수정");
    expect(menuItems[1]).toHaveTextContent("카테고리 삭제");
  });

  it("`카테고리 수정` 메뉴를 클릭하면 EditCategoryFormModal을 렌더링한다.", async () => {
    const { getByRole, findByRole } = renderCategoryDropdownMenu();

    const button = getByRole("button", { name: "카테고리 관련 메뉴" });
    userEvent.click(button);

    const editCategoryMenuItem = await findByRole("menuitem", {
      name: "카테고리 수정",
    });
    userEvent.click(editCategoryMenuItem);

    const editCategoryFormModal = await findByRole("dialog");
    expect(editCategoryFormModal).toHaveTextContent(/카테고리 수정하기/g);
  });

  it("EditCategoryFormModal이 렌더링된 상태에서 Form 외부를 클릭하면 Modal이 닫힌다.", async () => {
    // given
    const { getByRole, findByRole } = renderCategoryDropdownMenu();

    const button = getByRole("button", { name: "카테고리 관련 메뉴" });
    userEvent.click(button);

    const editCategoryMenuItem = await findByRole("menuitem", {
      name: "카테고리 수정",
    });
    userEvent.click(editCategoryMenuItem);

    const editCategoryFormModal = await findByRole("dialog");
    expect(editCategoryFormModal).toBeInTheDocument();

    // when
    userEvent.click(editCategoryFormModal);

    // then
    await waitFor(() => {
      expect(editCategoryFormModal).not.toBeInTheDocument();
    });
  });

  it("`카테고리 삭제` 메뉴를 클릭하면 DeleteCategoryFormModal을 렌더링한다.", async () => {
    const { getByRole, findByRole } = renderCategoryDropdownMenu();

    const button = getByRole("button", { name: "카테고리 관련 메뉴" });
    userEvent.click(button);

    const deleteCategoryMenuItem = await findByRole("menuitem", {
      name: "카테고리 삭제",
    });
    userEvent.click(deleteCategoryMenuItem);

    const deleteCategoryFormModal = await findByRole("dialog");
    expect(deleteCategoryFormModal).toHaveTextContent(/카테고리 삭제/g);
  });

  it("DeleteCategoryFormModal이 렌더링된 상태에서 Form 외부를 클릭하면 Modal이 닫힌다.", async () => {
    // given
    const { getByRole, findByRole } = renderCategoryDropdownMenu();

    const button = getByRole("button", { name: "카테고리 관련 메뉴" });
    userEvent.click(button);

    const deleteCategoryMenuItem = await findByRole("menuitem", {
      name: "카테고리 삭제",
    });
    userEvent.click(deleteCategoryMenuItem);

    const deleteCategoryFormModal = await findByRole("dialog");
    expect(deleteCategoryFormModal).toBeInTheDocument();

    // when
    userEvent.click(deleteCategoryFormModal);

    // then
    await waitFor(() => {
      expect(deleteCategoryFormModal).not.toBeInTheDocument();
    });
  });
});
