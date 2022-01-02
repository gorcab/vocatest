import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { server } from "../../../../mocks/server";
import { render, waitForElementToBeRemoved } from "../../utils/test-utils";
import { Sidebar } from "../Sidebar";

describe("Sidebar", () => {
  const categories = [
    { id: 1, name: "토익" },
    { id: 2, name: "토플" },
  ];

  function renderSidebar() {
    const width = 200,
      show = true;
    const portal = document.createElement("div");
    portal.classList.add("portal");

    const { getByRole, findByRole, findAllByRole, debug } = render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Sidebar width={width} show={show} />
                <Outlet />
              </>
            }
          >
            {categories.map((category) => (
              <Route
                key={category.id}
                path={`categories/${category.id}`}
                element={<div>{category.name}</div>}
              />
            ))}
          </Route>
        </Routes>
      </BrowserRouter>,
      {
        container: document.body.appendChild(portal),
      }
    );

    return {
      getByRole,
      debug,
      findByRole,
      findAllByRole,
    };
  }

  beforeEach(() => {
    window.history.replaceState({}, "", "/");

    server.use(
      rest.get(
        `${process.env.REACT_APP_API_URL}/categories`,
        (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              categories,
            })
          );
        }
      )
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("`카테고리 생성` 버튼과 서버로부터 받은 카테고리 목록을 렌더링한다.", async () => {
    const { getByRole, findAllByRole } = renderSidebar();

    const createCategoryButton = getByRole("button", { name: "카테고리 생성" });
    await waitForElementToBeRemoved(document.querySelector(".animate-spin"));
    const categoryList = await findAllByRole("listitem");

    expect(createCategoryButton).toBeInTheDocument();
    expect(categoryList).toHaveLength(2);
    expect(categoryList[0]).toHaveTextContent("토익");
    expect(categoryList[1]).toHaveTextContent("토플");
  });

  it("`카테고리 생성` 버튼을 클릭하면 카테고리 생성 폼 모달을 띄운다.", async () => {
    const { getByRole, findByRole } = renderSidebar();

    const createCategoryButton = getByRole("button", { name: "카테고리 생성" });
    userEvent.click(createCategoryButton);

    const createCategoryFormModal = await findByRole("dialog");

    expect(createCategoryFormModal).toHaveTextContent("카테고리 생성하기");
  });

  it("카테고리를 클릭하면 해당 카테고리 페이지로 이동한다.", async () => {
    const { getByRole } = renderSidebar();
    await waitForElementToBeRemoved(document.querySelector(".animate-spin"));
    const toeicCategory = getByRole("link", { name: categories[0].name });

    userEvent.click(toeicCategory);
    const { pathname, search } = window.location;

    expect(pathname + search).toBe(`/categories/${categories[0].id}`);
  });
});