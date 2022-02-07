import { rest } from "msw";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { server } from "../../../../mocks/server";
import { CategoryDto } from "../../../api/types";
import { DEFAULT_PER_PAGE } from "../../../common/utils/constants";
import {
  render,
  waitForElementToBeRemoved,
} from "../../../common/utils/test-utils";
import { ToastContainer } from "../../../toast/components/ToastContainer";
import { CategoryPageTemplate } from "../CategoryPageTemplate";

describe("CategoryPageTemplate", () => {
  const categories: Array<CategoryDto> = [
    { id: 1, name: "토익" },
    { id: 2, name: "토플" },
    { id: 3, name: "텝스" },
  ];

  function renderCategoryPageTemplate(
    url: string = `/?page=1&perPage=12&category=${categories[0].id}`
  ) {
    window.history.replaceState({}, "", url);
    const searchParams = new URLSearchParams(window.location.search);
    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("perPage")) || DEFAULT_PER_PAGE;
    const title = searchParams.get("title") ?? undefined;
    const categoryId = Number(searchParams.get("category"));
    const Component = (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <CategoryPageTemplate
                  page={page}
                  perPage={perPage}
                  title={title}
                  categoryId={categoryId}
                />
                <ToastContainer />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, getAllByRole } = render(Component);

    return {
      getByRole,
      getAllByRole,
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
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("querystring으로 받은 categoryId가 서버로부터 받은 categories 내에 존재하는 id가 아니라면 NotFoundPage를 렌더링한다.", async () => {
    const categoryId = categories[categories.length - 1].id + 1;
    const { getByRole } = renderCategoryPageTemplate(
      `/?page=1&perPage=12&category=${categoryId}`
    );

    await waitForElementToBeRemoved(document.querySelector(".animate-pulse"));

    const errorMessage = getByRole("alert");

    expect(errorMessage).toHaveTextContent(
      "요청하신 페이지를 찾을 수 없습니다."
    );
  });

  it("카테고리 조회에 성공하면 해당 카테고리에 대한 상세 페이지를 보여준다.", async () => {
    const { getByRole, getAllByRole } = renderCategoryPageTemplate();

    await waitForElementToBeRemoved(document.querySelector(".animate-pulse"));

    const heading = getByRole("heading", { name: categories[0].name });
    const addVocabularyListButton = getByRole("button", {
      name: "단어장 생성",
    });

    await waitForElementToBeRemoved(document.querySelector(".animate-pulse"));

    const [vocabularyCardList, pagination] = getAllByRole("list");

    expect(heading).toBeInTheDocument();
    expect(addVocabularyListButton).toBeInTheDocument();
    expect(vocabularyCardList).toBeInTheDocument();
    expect(pagination).toBeInTheDocument();
  });

  it('카테고리 페이지 내에서 단어장을 검색하면 `${category.name} 카테고리 내 "${title}"에 대한 검색 결과`를 title로 보여준다.', async () => {
    const searchQuery = "DAY-1";
    const { getByRole } = renderCategoryPageTemplate(
      `/?page=1&perPage=12&category=${
        categories[0].id
      }&title=${encodeURIComponent(searchQuery)}`
    );
    await waitForElementToBeRemoved(document.querySelector(".animate-pulse"));

    const title = getByRole("heading", {
      name: `${categories[0].name} 카테고리 내 "${searchQuery}"에 대한 검색 결과`,
    });

    expect(title).toBeInTheDocument();
  });
});
