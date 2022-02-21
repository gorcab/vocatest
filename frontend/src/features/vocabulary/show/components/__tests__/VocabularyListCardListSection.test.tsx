import { rest } from "msw";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "features/common/components/ErrorBoundary";
import { DEFAULT_PER_PAGE } from "features/common/utils/constants";
import {
  render,
  waitForElementToBeRemoved,
} from "features/common/utils/test-utils";
import { server } from "mocks/test/server";
import { VocabularyListCardListSection } from "../VocabularyListCardListSection";
import {
  failToGetVocabularyListsResponse,
  serverErrorForGetVocabularyListsResponse,
  successToGetVocabularyLists,
} from "mocks/test/vocabulary.mock";

describe("VocabularyListCardListSection", () => {
  let consoleError: typeof console.error;
  function getUrlParams() {
    const searchParams = new URLSearchParams(window.location.search);
    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("perPage")) || DEFAULT_PER_PAGE;
    const title = searchParams.get("title") ?? undefined;
    const categoryId = Number(searchParams.get("category")) ?? undefined;

    return {
      page,
      perPage,
      title,
      categoryId,
    };
  }

  function renderVocabularyListCardListSection(
    initialUrl: string = "/?page=1&perPage=12"
  ) {
    window.history.replaceState({}, "", initialUrl);
    const { page, perPage, title, categoryId } = getUrlParams();
    const onReset = jest.fn();

    const Component = (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ErrorBoundary onReset={onReset}>
                <VocabularyListCardListSection
                  page={page}
                  perPage={perPage}
                  title={title}
                  categoryId={categoryId}
                />
              </ErrorBoundary>
            }
          />
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, getAllByRole } = render(Component);

    return {
      onReset,
      getByRole,
      getAllByRole,
      page,
      perPage,
      title,
      categoryId,
    };
  }

  beforeEach(() => {
    server.use(successToGetVocabularyLists);
    consoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = consoleError;
    server.resetHandlers();
  });

  it("서버로부터 응답으로 받은 단어장들과 Pagination이 렌더링된다.", async () => {
    // given
    const { getByRole } = renderVocabularyListCardListSection();

    // wheh
    await waitForElementToBeRemoved(
      () => document.querySelector(".animate-pulse"),
      { timeout: 1000 }
    );

    // then
    const vocabularyLists = getByRole("list", { name: "단어장 목록" });
    const pagination = getByRole("navigation", { name: "pagination" });
    expect(vocabularyLists).toBeInTheDocument();
    expect(pagination).toBeInTheDocument();
  });

  it("서버 측으로부터 4XX 에러를 응답으로 받으면, `단어장 조회에 실패했습니다.` 메시지와 `재요청` 버튼을 렌더링한다.", async () => {
    server.use(failToGetVocabularyListsResponse);
    const { getByRole } = renderVocabularyListCardListSection("/");
    await waitForElementToBeRemoved(
      () => document.querySelector(".animate-pulse"),
      { timeout: 1000 }
    );

    const errorMessage = getByRole("alert");
    const refetchButton = getByRole("button", { name: "재요청" });

    expect(errorMessage).toHaveTextContent("단어장 조회에 실패했습니다.");
    expect(refetchButton).toBeInTheDocument();
  });

  it("서버 측으로부터 5XX 에러를 응답으로 받으면, `서버 측 에러가 발생했습니다. 잠시 후에 이용해주세요.` 메시지를 보여준다.", async () => {
    server.use(serverErrorForGetVocabularyListsResponse);
    const { getByRole } = renderVocabularyListCardListSection("/");
    await waitForElementToBeRemoved(
      () => document.querySelector(".animate-pulse"),
      { timeout: 1000 }
    );

    const errorBoundaryMessage = getByRole("alert");

    expect(errorBoundaryMessage).toHaveTextContent(
      "서버 측 에러가 발생했습니다. 잠시 후에 이용해주세요."
    );
  });
});
