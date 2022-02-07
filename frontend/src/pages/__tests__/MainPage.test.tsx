import { rest } from "msw";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { PagedVocabularyListsResponse } from "../../features/api/types";
import { DEFAULT_PER_PAGE } from "../../features/common/utils/constants";
import {
  render,
  waitForElementToBeRemoved,
} from "../../features/common/utils/test-utils";
import {
  createEntireVocabularyLists,
  createMockVocabularyListsInEachCategory,
  getPageBasedEntireVocabularyLists,
  getQueryParamsFromRestRequest,
  getPageBasedVocabularyListsOfSpecificTitle,
} from "../../mocks/handlers";
import { server } from "../../mocks/server";
import { MainPage } from "../MainPage";

describe("MainPage", () => {
  function setServerResponse() {
    const searchParams = new URLSearchParams(window.location.search);
    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("perPage")) || DEFAULT_PER_PAGE;
    const title = searchParams.get("title");
    const mockVocabularyLists = createMockVocabularyListsInEachCategory();
    const entireVocabularyLists =
      createEntireVocabularyLists(mockVocabularyLists);
    let response: PagedVocabularyListsResponse | null = null;

    if (title) {
      response = getPageBasedVocabularyListsOfSpecificTitle(
        entireVocabularyLists,
        title,
        page,
        perPage
      );
    } else {
      response = getPageBasedEntireVocabularyLists(
        entireVocabularyLists,
        page,
        perPage
      );
    }

    server.use(
      rest.get(
        `${process.env.REACT_APP_API_URL}/vocabularies`,
        (req, res, ctx) => {
          const { page, perPage, title } = getQueryParamsFromRestRequest(req);
          if (title) {
            response = getPageBasedVocabularyListsOfSpecificTitle(
              entireVocabularyLists,
              title,
              page,
              perPage
            );
          } else {
            response = getPageBasedEntireVocabularyLists(
              entireVocabularyLists,
              page,
              perPage
            );
          }
          return res(ctx.status(200), ctx.json(response));
        }
      )
    );

    return {
      page,
      perPage,
    };
  }

  function renderMainPage(currentUrl: string = "/") {
    window.history.replaceState({}, "", currentUrl);
    const { page, perPage } = setServerResponse();

    const Component = (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Outlet />
              </>
            }
          >
            <Route index element={<MainPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, getAllByRole, findByRole, debug } = render(Component);

    return {
      page,
      perPage,
      getByRole,
      getAllByRole,
      findByRole,
      debug,
    };
  }

  afterEach(() => {
    server.resetHandlers();
  });

  it("`/` url를 통해 MainPage가 렌더링되면 `/?page=1&perPage=${DEFAULT_PER_PAGE}`로 redirect된다.", () => {
    renderMainPage("/");

    const { pathname, search } = window.location;
    expect(pathname + search).toBe(`/?page=1&perPage=${DEFAULT_PER_PAGE}`);
  });

  it("url에 `category` queryString이 포함되어 있으면 카테고리 상세 페이지를 렌더링한다.", async () => {
    const categories = [{ id: 1, name: "토익" }];
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
    const { getByRole } = renderMainPage(
      `/?page=1&perPage=12&category=${categories[0].id}`
    );

    await waitForElementToBeRemoved(() => getByRole("status"));

    const pageTitle = getByRole("heading", { name: categories[0].name });

    expect(pageTitle).toBeInTheDocument();
  });

  it("url에 `category` queryString이 포함되지 않으면 모든 카테고리의 단어장을 보여준다.", async () => {
    const { getByRole } = renderMainPage();

    const pageTitle = getByRole("heading", { name: "전체 보기" });

    expect(pageTitle).toBeInTheDocument();
  });
});
