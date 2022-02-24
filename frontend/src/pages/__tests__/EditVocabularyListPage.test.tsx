import { ErrorBoundary } from "features/common/components/ErrorBoundary";
import {
  render,
  waitForElementToBeRemoved,
} from "features/common/utils/test-utils";
import { ToastContainer } from "features/toast/components/ToastContainer";

import {
  createMockVocabularyListsInEachCategory,
  getEntireVocabularyLists,
} from "mocks/lib/vocabulary.factory";
import {
  failToGetCategoriesResponse,
  serverErrorForGettingCategoriesResponse,
  successToGetCategoriesResponse,
  successToGetEmptyCategoryResponse,
} from "mocks/test/category.mock";
import { server } from "mocks/test/server";
import {
  successToGetDetailedVocabularyListResponse,
  clientErrorForGetDetailedVocabularyListResponse,
  forbidToGetDetailedVocabularyListResponse,
  serverErrorForGetDetailedVocabularyListResponse,
} from "mocks/test/vocabulary.mock";
import { EditVocabularyListPage } from "pages/EditVocabularyListPage";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

describe("EditVocabularyListPage", () => {
  const vocabularyListsRecord = createMockVocabularyListsInEachCategory();
  const entireVocabularyLists = getEntireVocabularyLists(vocabularyListsRecord);
  const vocabularyList = entireVocabularyLists[0];
  let consoleError: typeof console.error;
  function renderEditVocabularyListPage() {
    const onReset = jest.fn();
    window.history.replaceState(
      {},
      "",
      `/edit-vocabulary/${vocabularyList.id}`
    );

    const Component = (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Outlet />}>
            <Route
              path="edit-vocabulary/:id"
              element={
                <ErrorBoundary onReset={onReset}>
                  <EditVocabularyListPage />
                  <ToastContainer />
                </ErrorBoundary>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, findByRole } = render(Component);

    return {
      getByRole,
      findByRole,
    };
  }

  beforeAll(() => {
    consoleError = console.error;
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = consoleError;
  });

  beforeEach(() => {
    server.use(
      ...[
        successToGetCategoriesResponse,
        successToGetDetailedVocabularyListResponse(vocabularyList),
      ]
    );
  });

  afterEach(() => {
    server.restoreHandlers();
  });

  it("서버로부터 카테고리와 단어장을 성공적으로 받으면 `단어장 수정` 타이틀과 단어장 수정 폼을 렌더링한다.", async () => {
    const { getByRole } = renderEditVocabularyListPage();

    await waitForElementToBeRemoved(() =>
      document.querySelector(".animate-pulse")
    );

    const title = getByRole("heading", { name: "단어장 수정" });
    const form = getByRole("form", { name: "단어장 수정 폼" });

    expect(title).toBeInTheDocument();
    expect(form).toBeInTheDocument();
  });

  it("단어장 조회에 실패(4XX 에러, 403 에러 제외)하면 `단어장을 불러오는데 실패했습니다.` 메시지와 재요청 버튼을 렌더링한다.", async () => {
    server.use(clientErrorForGetDetailedVocabularyListResponse);
    const { getByRole } = renderEditVocabularyListPage();

    await waitForElementToBeRemoved(() =>
      document.querySelector(".animate-pulse")
    );

    const alertMessage = getByRole("alert");
    const refetchButton = getByRole("button", { name: "재요청" });

    expect(alertMessage).toHaveTextContent("단어장을 불러오는데 실패했습니다.");
    expect(refetchButton).toBeInTheDocument();
  });

  it("단어장 조회에 실패(403 에러)하면 `페이지를 찾을 수 없습니다.` 메시지와 `메인 페이지로 돌아가기` 버튼을 렌더링한다.", async () => {
    server.use(forbidToGetDetailedVocabularyListResponse);
    const { findByRole } = renderEditVocabularyListPage();

    const alertMessage = await findByRole("alert");
    const navigateButton = await findByRole("button", {
      name: "메인 페이지로 돌아가기",
    });

    expect(alertMessage).toHaveTextContent("페이지를 찾을 수 없습니다.");
    expect(navigateButton).toBeInTheDocument();
  });

  it("단어장 조회에 실패(5XX 에러)하면 `서버 측 에러가 발생했습니다. 잠시 후에 이용해주세요.` 메시지를 렌더링한다.", async () => {
    server.use(serverErrorForGetDetailedVocabularyListResponse);
    const { findByRole } = renderEditVocabularyListPage();
    const alertMessage = await findByRole("alert");

    expect(alertMessage).toHaveTextContent(
      "서버 측 에러가 발생했습니다. 잠시 후에 이용해주세요."
    );
  });

  it("카테고리 조회에 실패(4XX 에러)하면 `단어장 수정을 위해서는 카테고리 조회가 필요합니다. 카테고리 조회를 재요청해주세요.` 메시지와 `재요청` 버튼을 렌더링한다.", async () => {
    server.use(failToGetCategoriesResponse);
    const { findByRole } = renderEditVocabularyListPage();

    const alertMessage = await findByRole("alert");
    const refetchButton = await findByRole("button", {
      name: "재요청",
    });

    expect(alertMessage).toHaveTextContent(
      "단어장 수정을 위해서는 카테고리 조회가 필요합니다. 카테고리 조회를 재요청해주세요."
    );
    expect(refetchButton).toBeInTheDocument();
  });

  it("카테고리 조회에 실패(5XX 에러)하면 `서버 측 에러가 발생했습니다. 잠시 후에 이용해주세요.` 메시지를 렌더링한다.", async () => {
    server.use(serverErrorForGettingCategoriesResponse);
    const { findByRole } = renderEditVocabularyListPage();
    const alertMessage = await findByRole("alert");

    expect(alertMessage).toHaveTextContent(
      "서버 측 에러가 발생했습니다. 잠시 후에 이용해주세요."
    );
  });

  it("생성된 카테고리가 아직 없다면 메인 페이지로 이동한다.", async () => {
    server.use(successToGetEmptyCategoryResponse);
    expect(window.location.pathname).toBe(
      `/edit-vocabulary/${vocabularyList.id}`
    );

    renderEditVocabularyListPage();
    await waitForElementToBeRemoved(() =>
      document.querySelector(".animate-pulse")
    );

    expect(window.location.pathname).toBe("/");
  });
});
