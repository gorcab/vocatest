import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { DEFAULT_PER_PAGE } from "features/common/utils/constants";
import {
  render,
  waitFor,
  waitForElementToBeRemoved,
} from "features/common/utils/test-utils";
import { ToastContainer } from "features/toast/components/ToastContainer";
import { server } from "mocks/test/server";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { MainPageTemplate } from "../MainPageTemplate";
import {
  successToGetCategoriesResponse,
  successToGetEmptyCategoryResponse,
} from "mocks/test/category.mock";
import { successToGetVocabularyLists } from "mocks/test/vocabulary.mock";
import { mockCategories } from "mocks/lib/category.factory";

describe("MainPageTemplate", () => {
  function setServerResponse() {
    const searchParams = new URLSearchParams(window.location.search);
    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("perPage")) || DEFAULT_PER_PAGE;
    const title = searchParams.get("title") ?? undefined;

    return {
      page,
      perPage,
      title,
    };
  }

  function renderMainPageTemplate(url: string = "/?page=1&perPage=12") {
    window.history.replaceState({}, "", url);
    const { page, perPage, title } = setServerResponse();

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
      page,
      perPage,
      getByRole,
      getAllByRole,
      findByRole,
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

  it("title을 query parameter로 받지 않으면 `전체 보기` heading과 서버로부터 받은 단어장, Pagination을 렌더링한다.", async () => {
    // given
    const { getByRole, getAllByRole } = renderMainPageTemplate();

    // when
    await waitForElementToBeRemoved(
      () => document.querySelector(".animate-pulse"),
      { timeout: 1000 }
    );

    // then
    const heading = getByRole("heading", { name: "전체 보기" });
    const [vocabularyCardList, pagination] = getAllByRole("list");
    expect(heading).toBeInTheDocument();
    expect(vocabularyCardList).toBeInTheDocument();
    expect(pagination).toBeInTheDocument();
  });

  it("title을 query parameter로 받으면 `${title}에 대한 검색 결과`를 heading으로 갖고, `${title}`이 들어간 단어장들만 서버로부터 받아 렌더링한다.", async () => {
    // given
    const title = mockCategories[0].name;
    const encodedTitle = encodeURIComponent(title);
    const { getByRole, getAllByRole } = renderMainPageTemplate(
      `/?page=1&perPage=12&title=${encodedTitle}`
    );

    // when
    await waitForElementToBeRemoved(
      () => document.querySelector(".animate-pulse"),
      { timeout: 1000 }
    );

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
    server.use(successToGetEmptyCategoryResponse);
    const { getByRole, findByRole } = renderMainPageTemplate();
    await waitFor(
      () => {
        expect(getByRole("button", { name: "단어장 생성" })).not.toBeDisabled();
      },
      { timeout: 1000 }
    );
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
    const { getByRole } = renderMainPageTemplate();
    await waitFor(
      () => {
        expect(getByRole("button", { name: "단어장 생성" })).not.toBeDisabled();
      },
      { timeout: 1000 }
    );

    const createVocabularyButton = getByRole("button", {
      name: "단어장 생성",
    });

    // when
    userEvent.click(createVocabularyButton);

    // then
    expect(window.location.pathname).toBe("/create-vocabulary");
  });
});
