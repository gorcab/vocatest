import { mockCategories } from "mocks/lib/category.factory";
import { successToGetCategoriesResponse } from "mocks/test/category.mock";
import { successToGetVocabularyLists } from "mocks/test/vocabulary.mock";
import { rest } from "msw";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { PagedVocabularyListsResponse } from "../../features/api/types";
import { DEFAULT_PER_PAGE } from "../../features/common/utils/constants";
import {
  render,
  waitForElementToBeRemoved,
} from "../../features/common/utils/test-utils";
import { server } from "../../mocks/test/server";
import { MainPage } from "../MainPage";

describe("MainPage", () => {
  function setServerResponse() {
    const searchParams = new URLSearchParams(window.location.search);
    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("perPage")) || DEFAULT_PER_PAGE;
    const title = searchParams.get("title");
    // const mockVocabularyLists = createMockVocabularyListsInEachCategory();
    // const entireVocabularyLists =
    //   createEntireVocabularyLists(mockVocabularyLists);
    // let response: PagedVocabularyListsResponse | null = null;

    // if (title) {
    //   response = getPageBasedVocabularyListsOfSpecificTitle(
    //     entireVocabularyLists,
    //     title,
    //     page,
    //     perPage
    //   );
    // } else {
    //   response = getPageBasedEntireVocabularyLists(
    //     entireVocabularyLists,
    //     page,
    //     perPage
    //   );
    // }

    // server.use(
    //   rest.get(
    //     `${process.env.REACT_APP_API_URL}/vocabularies`,
    //     (req, res, ctx) => {
    //       const { page, perPage, title } = getQueryParamsFromRestRequest(req);
    //       if (title) {
    //         response = getPageBasedVocabularyListsOfSpecificTitle(
    //           entireVocabularyLists,
    //           title,
    //           page,
    //           perPage
    //         );
    //       } else {
    //         response = getPageBasedEntireVocabularyLists(
    //           entireVocabularyLists,
    //           page,
    //           perPage
    //         );
    //       }
    //       return res(ctx.status(200), ctx.json(response));
    //     }
    //   )
    // );

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

  beforeEach(() => {
    server.use(
      ...[successToGetCategoriesResponse, successToGetVocabularyLists]
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("`/` url??? ?????? MainPage??? ??????????????? `/?page=1&perPage=${DEFAULT_PER_PAGE}`??? redirect??????.", () => {
    renderMainPage("/");

    const { pathname, search } = window.location;
    expect(pathname + search).toBe(`/?page=1&perPage=${DEFAULT_PER_PAGE}`);
  });

  it("url??? `category` queryString??? ???????????? ????????? ???????????? ?????? ???????????? ???????????????.", async () => {
    const { getByRole } = renderMainPage(
      `/?page=1&perPage=12&category=${mockCategories[0].id}`
    );

    await waitForElementToBeRemoved(() => getByRole("status"));

    const pageTitle = getByRole("heading", {
      name: mockCategories[0].name,
    });

    expect(pageTitle).toBeInTheDocument();
  });

  it("url??? `category` queryString??? ???????????? ????????? ?????? ??????????????? ???????????? ????????????.", async () => {
    const { getByRole } = renderMainPage();

    const pageTitle = getByRole("heading", { name: "?????? ??????" });

    expect(pageTitle).toBeInTheDocument();
  });
});
