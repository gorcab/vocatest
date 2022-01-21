import { rest } from "msw";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { server } from "../../../../mocks/server";
import { CategoryDto } from "../../../api/types";
import {
  render,
  waitForElementToBeRemoved,
} from "../../../common/utils/test-utils";
import { CategoryPageTemplate } from "../CategoryPageTemplate";

describe("CategoryPageTemplate", () => {
  const categories: Array<CategoryDto> = [
    { id: 1, name: "토익" },
    { id: 2, name: "토플" },
    { id: 3, name: "텝스" },
  ];
  function renderCategoryPageTemplate() {
    const portal = document.createElement("div");
    portal.classList.add("portal");

    const Component = (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <CategoryPageTemplate />
                {/* <ToastContainer /> */}
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    );

    const { getByRole } = render(Component, {
      container: document.body.appendChild(portal),
    });

    return {
      getByRole,
    };
  }

  beforeEach(() => {
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
    // window.history.replaceState(
    //   {},
    //   "",
    //   `/?page=1&perPage=12&category=${category.id}`
    // );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("querystring으로 받은 categoryId가 서버로부터 받은 categories 내에 존재하는 id가 아니라면 NotFoundPage를 렌더링한다.", async () => {
    const categoryId = 4;
    window.history.replaceState(
      {},
      "",
      `/?page=1&perPage=12&category=${categoryId}`
    );
    const { getByRole } = renderCategoryPageTemplate();

    await waitForElementToBeRemoved(document.querySelector(".animate-pulse"));

    const errorMessage = getByRole("alert");

    expect(errorMessage).toHaveTextContent(
      "요청하신 페이지를 찾을 수 없습니다."
    );
  });

  it("카테고리 조회에 성공하면 해당 카테고리에 대한 상세 페이지를 보여준다.", async () => {
    window.history.replaceState(
      {},
      "",
      `/?page=1&perPage=12&category=${categories[0].id}`
    );
    const { getByRole } = renderCategoryPageTemplate();

    await waitForElementToBeRemoved(document.querySelector(".animate-pulse"));

    const heading = getByRole("heading", { name: categories[0].name });
    const addVocabularyListButton = getByRole("button", {
      name: "단어장 생성",
    });

    expect(heading).toBeInTheDocument();
    expect(addVocabularyListButton).toBeInTheDocument();
  });
});
