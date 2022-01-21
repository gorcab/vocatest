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
  function renderMainPage(currentUrl: string = "/") {
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

    window.history.replaceState({}, "", currentUrl);
    const portal = document.createElement("div");
    portal.classList.add("portal");
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

    const { getByRole, getAllByRole, findByRole, debug } = render(Component, {
      container: document.body.appendChild(portal),
    });

    return {
      searchParams,
      response,
      entireVocabularyLists,
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

  it("title을 query parameter로 받지 않으면 `전체 보기` heading과 서버로부터 받은 단어장, Pagination을 렌더링한다.", async () => {
    // given
    const {
      getByRole,
      getAllByRole,
      entireVocabularyLists,
      response,
      perPage,
    } = renderMainPage();

    const totalPage = Math.ceil(entireVocabularyLists.length / perPage);

    server.use(
      rest.get(
        `${process.env.REACT_APP_API_URL}/vocabularies`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(response));
        }
      )
    );

    // when
    await waitForElementToBeRemoved(document.querySelector(".animate-pulse"));

    // then
    const heading = getByRole("heading", { name: "전체 보기" });
    const [cardList, pagination] = getAllByRole("list");
    expect(heading).toBeInTheDocument();
    Array.from(cardList.children).forEach((list, index) => {
      expect(list).toHaveTextContent(entireVocabularyLists[index].title);
    });
    expect(pagination.firstChild).toHaveTextContent("이전 페이지로 가기");
    expect(pagination.lastChild).toHaveTextContent("다음 페이지로 가기");
    expect(pagination.childElementCount).toBe(
      (totalPage > 5 ? 5 : totalPage) + 2
    );
  });

  it("title을 query parameter로 받으면 `${title}에 대한 검색 결과`를 heading으로 갖고, `${title}`이 들어간 단어장들만 서버로부터 받아 렌더링한다.", async () => {
    // given
    server.use(
      rest.get(
        `${process.env.REACT_APP_API_URL}/vocabularies`,
        (req, res, ctx) => {
          const { page, perPage, title } = getQueryParamsFromRestRequest(req);
          const result = getPageBasedVocabularyListsOfSpecificTitle(
            response.data,
            title as string,
            page,
            perPage
          );
          return res(ctx.status(200), ctx.json(result));
        }
      )
    );

    const title = "토익";
    const encodedTitle = encodeURIComponent(title);
    const { getByRole, getAllByRole, response } = renderMainPage(
      `/?title=${encodedTitle}`
    );

    // when
    await waitForElementToBeRemoved(document.querySelector(".animate-pulse"));

    // then
    const heading = getByRole("heading", {
      name: `"${title}"에 대한 검색 결과`,
    });
    const [cardList] = getAllByRole("list");
    Array.from(cardList.children).forEach((list, index) => {
      expect(list).toHaveTextContent(new RegExp(`${title}`));
    });
    expect(heading).toBeInTheDocument();
  });
});
