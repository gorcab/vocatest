import { ErrorBoundary } from "features/common/components/ErrorBoundary";
import {
  render,
  waitForElementToBeRemoved,
} from "features/common/utils/test-utils";
import {
  failToGetCategoriesResponse,
  serverErrorForGettingCategoriesResponse,
  successToGetCategoriesResponse,
} from "mocks/test/category.mock";
import { server } from "mocks/test/server";
import { CreateVocabularyListPage } from "pages/CreateVocabularyListPage";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

describe("CreateVocabularyListPage", () => {
  let consoleError: typeof console.error;
  function renderCreateVocabularyListPage() {
    const onReset = jest.fn();
    window.history.replaceState({}, "", "/create-vocabulary");
    const { getByRole } = render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Outlet />}>
            <Route
              path="create-vocabulary"
              element={
                <ErrorBoundary onReset={onReset}>
                  <CreateVocabularyListPage />
                </ErrorBoundary>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    return {
      getByRole,
    };
  }

  beforeEach(() => {
    consoleError = console.error;
    console.error = jest.fn();
    server.use(successToGetCategoriesResponse);
  });

  afterEach(() => {
    console.error = consoleError;
    server.resetHandlers();
  });

  it("최초 렌더링 시 `단어장 생성` 타이틀과 단어장을 생성하기 위한 폼을 렌더링한다.", async () => {
    const { getByRole } = renderCreateVocabularyListPage();

    await waitForElementToBeRemoved(() =>
      document.querySelector(".animate-pulse")
    );

    const title = getByRole("heading", { name: "단어장 생성" });
    const form = getByRole("form", { name: "단어장 생성 폼" });

    expect(title).toBeInTheDocument();
    expect(form).toBeInTheDocument();
  });

  it("카테고리 조회 실패 시 카테고리 조회 실패 메시지와 재요청 버튼을 렌더링한다.", async () => {
    server.use(failToGetCategoriesResponse);
    const { getByRole } = renderCreateVocabularyListPage();

    await waitForElementToBeRemoved(() =>
      document.querySelector(".animate-pulse")
    );

    const errorMessage = getByRole("alert");
    const resetBtn = getByRole("button", { name: "재요청" });

    expect(errorMessage).toHaveTextContent(
      "단어장 생성을 위해서는 카테고리 조회가 필요합니다. 카테고리 조회를 재요청해주세요."
    );
    expect(resetBtn).toBeInTheDocument();
  });

  it("서버 측 에러로 인해 카테고리 조회 실패 시 `서버 측 에러가 발생했습니다. 잠시 후에 이용해주세요.` 메시지를 보여준다.", async () => {
    server.use(serverErrorForGettingCategoriesResponse);
    const { getByRole } = renderCreateVocabularyListPage();

    await waitForElementToBeRemoved(() =>
      document.querySelector(".animate-pulse")
    );

    const errorMessage = getByRole("alert");

    expect(errorMessage).toHaveTextContent(
      "서버 측 에러가 발생했습니다. 잠시 후에 이용해주세요."
    );
  });
});
