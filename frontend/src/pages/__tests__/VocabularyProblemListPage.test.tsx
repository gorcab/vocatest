import { rest } from "msw";
import {
  render,
  waitForElementToBeRemoved,
} from "../../features/common/utils/test-utils";
import { server } from "../../mocks/test/server";
import { VocabularyProblemListPage } from "../VocabularyProblemListPage";
import { ErrorBoundary } from "../../features/common/components/ErrorBoundary";
import { DetailedVocabularyListDto } from "features/api/types";
import { createMockVocabularyList } from "mocks/lib/vocabulary.factory";
import {
  clientErrorForGetDetailedVocabularyListResponse,
  forbidToGetDetailedVocabularyListResponse,
  serverErrorForGetDetailedVocabularyListResponse,
  successToGetDetailedVocabularyListResponse,
} from "mocks/test/vocabulary.mock";

describe("VocabularyProblemListPage", () => {
  let consoleError: typeof console.error;
  let vocabularyList: DetailedVocabularyListDto;

  function renderVocabularyProblemListPage() {
    const onReset = jest.fn();
    const { getByRole, findByRole } = render(
      <ErrorBoundary onReset={onReset} fallbackUIWrapperClassName="">
        <VocabularyProblemListPage />
      </ErrorBoundary>
    );

    return {
      getByRole,
      findByRole,
    };
  }

  beforeEach(() => {
    consoleError = console.error;
    console.error = jest.fn();
    vocabularyList = createMockVocabularyList();
    server.use(successToGetDetailedVocabularyListResponse(vocabularyList));
  });

  afterEach(() => {
    console.error = consoleError;
    server.resetHandlers();
  });

  it("서버 측으로부터 단어장 데이터를 응답으로 받으면 학습을 위한 템플릿 컴포넌트를 렌더링한다.", async () => {
    const { getByRole } = renderVocabularyProblemListPage();
    await waitForElementToBeRemoved(() =>
      document.querySelector(".animate-pulse")
    );

    const heading = getByRole("heading", { name: vocabularyList.title });
    expect(heading).toBeInTheDocument();
  });

  it("서버 측 응답으로 403 에러를 응답으로 받으면 렌더링 중 에러 메시지를 보여준다.", async () => {
    // given
    server.use(forbidToGetDetailedVocabularyListResponse);

    // when
    const { getByRole } = renderVocabularyProblemListPage();
    await waitForElementToBeRemoved(() =>
      document.querySelector(".animate-pulse")
    );

    // then
    const errorBoundaryMessage = getByRole("alert");
    expect(errorBoundaryMessage).toHaveTextContent(
      "페이지를 찾을 수 없습니다."
    );
  });

  it("서버 측 응답으로부터 5XX 에러를 받으면 렌더링 중 에러를 던진다.", async () => {
    // given
    server.use(serverErrorForGetDetailedVocabularyListResponse);

    // when
    const { getByRole } = renderVocabularyProblemListPage();
    await waitForElementToBeRemoved(() =>
      document.querySelector(".animate-pulse")
    );

    // then
    const errorBoundaryMessage = getByRole("alert");
    expect(errorBoundaryMessage).toHaveTextContent(
      "서버 측 에러가 발생했습니다. 잠시 후에 이용해주세요."
    );
  });

  it("서버 측 응답으로부터 4XX(403 에러 제외) 에러를 받으면 서버 측으로부터의 메시지와 재요청 버튼을 렌더링한다.", async () => {
    // given
    server.use(clientErrorForGetDetailedVocabularyListResponse);

    // when
    const { getByRole } = renderVocabularyProblemListPage();
    await waitForElementToBeRemoved(() =>
      document.querySelector(".animate-pulse")
    );

    // then
    const errorBoundaryMessage = getByRole("alert");
    const refetchButton = getByRole("button", { name: "재요청" });
    expect(errorBoundaryMessage).toHaveTextContent(
      "단어장 조회에 실패했습니다."
    );
    expect(refetchButton).toBeInTheDocument();
  });
});
