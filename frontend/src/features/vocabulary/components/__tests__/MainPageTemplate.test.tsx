import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import {
  createEntireVocabularyLists,
  createMockVocabularyListsInEachCategory,
  getPageBasedEntireVocabularyLists,
  getPageBasedVocabularyListsOfSpecificTitle,
} from "../../../../mocks/handlers";
import { server } from "../../../../mocks/server";
import { ToastContainer } from "../../../toast/components/ToastContainer";
import { DEFAULT_PER_PAGE } from "../../../common/utils/constants";
import {
  render,
  waitFor,
  waitForElementToBeRemoved,
} from "../../../common/utils/test-utils";
import { MainPageTemplate } from "../MainPageTemplate";

describe("MainPageTemplate", () => {
  function setServerResponse() {
    const searchParams = new URLSearchParams(window.location.search);
    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("perPage")) || DEFAULT_PER_PAGE;
    const title = searchParams.get("title") ?? undefined;
    const mockVocabularyLists = createMockVocabularyListsInEachCategory();
    const entireVocabularyLists =
      createEntireVocabularyLists(mockVocabularyLists);
    const response = title
      ? getPageBasedVocabularyListsOfSpecificTitle(
          entireVocabularyLists,
          title,
          page,
          perPage
        )
      : getPageBasedEntireVocabularyLists(entireVocabularyLists, page, perPage);
    server.use(
      rest.get(
        `${process.env.REACT_APP_API_URL}/vocabularies`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(response));
        }
      )
    );

    return {
      page,
      perPage,
      title,
      response,
    };
  }

  function renderMainPageTemplate(url: string = "/?page=1&perPage=12") {
    window.history.replaceState({}, "", url);
    const { page, perPage, title, response } = setServerResponse();

    const Component = (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Outlet />}>
            <Route
              index
              element={
                <>
                  <MainPageTemplate
                    page={page}
                    perPage={perPage}
                    title={title}
                  />
                  <ToastContainer />
                </>
              }
            />
            <Route
              path="create-vocabulary"
              element={<div>단어장 생성 페이지</div>}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, getAllByRole, findByRole } = render(Component);

    return {
      response,
      page,
      perPage,
      getByRole,
      getAllByRole,
      findByRole,
    };
  }

  afterEach(() => {
    server.resetHandlers();
  });

  it("title을 query parameter로 받지 않으면 `전체 보기` heading과 서버로부터 받은 단어장, Pagination을 렌더링한다.", async () => {
    // given
    const { getByRole, getAllByRole, response } = renderMainPageTemplate();

    // when
    await waitForElementToBeRemoved(document.querySelector(".animate-pulse"));

    // then
    const heading = getByRole("heading", { name: "전체 보기" });
    const [vocabularyCardList, pagination] = getAllByRole("list");
    expect(heading).toBeInTheDocument();
    expect(vocabularyCardList).toBeInTheDocument();
    expect(pagination).toBeInTheDocument();
  });

  it("title을 query parameter로 받으면 `${title}에 대한 검색 결과`를 heading으로 갖고, `${title}`이 들어간 단어장들만 서버로부터 받아 렌더링한다.", async () => {
    // given
    const title = "토익";
    const encodedTitle = encodeURIComponent(title);
    const { getByRole, getAllByRole, response } = renderMainPageTemplate(
      `/?page=1&perPage=12&title=${encodedTitle}`
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

  it("카테고리가 존재하지 않는 상태에서 `단어장 생성` 버튼을 클릭하면 `카테고리를 먼저 생성해주세요.` 메시지를 Toast로 띄운다.", async () => {
    // given
    server.use(
      rest.get(
        `${process.env.REACT_APP_API_URL}/categories`,
        (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              categories: [],
            })
          );
        }
      )
    );
    const { getByRole, findByRole } = renderMainPageTemplate();
    await waitFor(() => {
      expect(getByRole("button", { name: "단어장 생성" })).not.toBeDisabled();
    });
    const createVocabularyButton = getByRole("button", {
      name: "단어장 생성",
    });

    // when
    userEvent.click(createVocabularyButton);

    // then
    const alertToast = await findByRole("alert");
    expect(alertToast).toHaveTextContent("카테고리를 먼저 생성해주세요.");
  });

  it("카테고리가 존재하는 상태에서 `단어장 생성` 버튼을 클릭하면 `/create-vocabulary` url로 이동한다.", async () => {
    // given
    server.use(
      rest.get(
        `${process.env.REACT_APP_API_URL}/categories`,
        (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              categories: [{ id: 1, name: "토익" }],
            })
          );
        }
      )
    );
    const { getByRole } = renderMainPageTemplate();
    await waitFor(() => {
      expect(getByRole("button", { name: "단어장 생성" })).not.toBeDisabled();
    });

    const createVocabularyButton = getByRole("button", {
      name: "단어장 생성",
    });

    // when
    userEvent.click(createVocabularyButton);

    // then
    expect(window.location.pathname).toBe("/create-vocabulary");
  });
});
