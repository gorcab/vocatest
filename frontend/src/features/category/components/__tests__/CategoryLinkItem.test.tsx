import userEvent from "@testing-library/user-event";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { render } from "../../../common/utils/test-utils";
import { CategoryLinkItem } from "../CategoryLinkItem";

describe("CategoryLinkItem", () => {
  function renderCategoryLinkItem(id?: number, path?: string) {
    id = id ?? 1;
    const name = "토익";
    path = path ?? `/?category=${id}`;

    const Component = (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<CategoryLinkItem id={id} name={name} path={path} />}
          />
        </Routes>
      </BrowserRouter>
    );

    const { getByRole } = render(Component);

    return {
      id,
      name,
      path,
      getByRole,
    };
  }

  it("Link를 렌더링한다.", () => {
    const { name, getByRole } = renderCategoryLinkItem();

    const link = getByRole("link", { name });

    expect(link).toBeInTheDocument();
    expect(link).toHaveClass("text-slate-600");
  });

  it("querystring의 category가 id와 같다면 해당 링크에 active class를 추가한다.", () => {
    const id = 1;
    window.history.replaceState({}, "", `/?category=${id}`);
    const { name, getByRole } = renderCategoryLinkItem(id);

    const link = getByRole("link", { name });

    expect(link).toHaveClass("text-blue-500");
  });

  it("link를 클릭하면 `${path}` url로 이동한다.", () => {
    window.history.replaceState({}, "", "/");
    const { name, path, getByRole } = renderCategoryLinkItem();

    const link = getByRole("link", { name });

    userEvent.click(link);

    expect(window.location.pathname + window.location.search).toBe(path);
  });
});
