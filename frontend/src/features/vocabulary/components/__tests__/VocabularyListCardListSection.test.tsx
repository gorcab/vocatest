import { rest } from "msw";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  createEntireVocabularyLists,
  createMockVocabularyListsInEachCategory,
  getPageBasedEntireVocabularyLists,
  getQueryParamsFromRestRequest,
} from "../../../../mocks/handlers";
import { server } from "../../../../mocks/server";
import { DEFAULT_PER_PAGE } from "../../../common/utils/constants";
import {
  render,
  waitForElementToBeRemoved,
} from "../../../common/utils/test-utils";
import { VocabularyListCardListSection } from "../VocabularyListCardListSection";

describe("VocabularyListCardListSection", () => {
  function setServerResponse(isBadRequest: boolean = false) {
    const searchParams = new URLSearchParams(window.location.search);
    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("perPage")) || DEFAULT_PER_PAGE;
    const title = searchParams.get("title") ?? undefined;
    const categoryId = Number(searchParams.get("category")) ?? undefined;

    const mockVocabularyListsInEachCategory =
      createMockVocabularyListsInEachCategory();
    const entireVocabularyLists = createEntireVocabularyLists(
      mockVocabularyListsInEachCategory
    );
    const errorMessage = "Bad Request";

    server.use(
      rest.get(
        `${process.env.REACT_APP_API_URL}/vocabularies`,
        (req, res, ctx) => {
          if (isBadRequest) {
            return res(
              ctx.status(400),
              ctx.json({
                status: 400,
                message: errorMessage,
              })
            );
          }

          const { page, perPage } = getQueryParamsFromRestRequest(req);
          return res(
            ctx.status(200),
            ctx.json({
              ...getPageBasedEntireVocabularyLists(
                entireVocabularyLists,
                page,
                perPage
              ),
            })
          );
        }
      )
    );

    return {
      page,
      perPage,
      title,
      categoryId,
      errorMessage,
      entireVocabularyLists,
    };
  }

  function renderVocabularyListCardListSection(
    initialUrl: string = "/?page=1&perPage=12",
    isBadRequest: boolean = false
  ) {
    window.history.replaceState({}, "", initialUrl);
    const {
      page,
      perPage,
      title,
      categoryId,
      errorMessage,
      entireVocabularyLists,
    } = setServerResponse(isBadRequest);

    const Component = (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <VocabularyListCardListSection
                page={page}
                perPage={perPage}
                title={title}
                categoryId={categoryId}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, getAllByRole } = render(Component);

    return {
      getByRole,
      getAllByRole,
      errorMessage,
      entireVocabularyLists,
    };
  }

  it("서버로부터 응답으로 받은 `perPage`만큼의 단어장들과 Pagination이 렌더링된다.", async () => {
    // given
    const { getAllByRole, entireVocabularyLists } =
      renderVocabularyListCardListSection();
    const renderedVocabularyLists = entireVocabularyLists.slice(
      0,
      DEFAULT_PER_PAGE
    );
    let pagesToShow = Math.ceil(
      entireVocabularyLists.length / DEFAULT_PER_PAGE
    );
    pagesToShow = pagesToShow > 5 ? 5 : pagesToShow;

    // wheh
    await waitForElementToBeRemoved(document.querySelector(".animate-pulse"));

    // then
    const [vocabularyLists, pagination] = getAllByRole("list");
    expect(vocabularyLists.childElementCount).toBe(
      renderedVocabularyLists.length
    );
    expect(pagination.childElementCount).toBe(pagesToShow + 2); // 페이지 갯수 + (이전 페이지 버튼, 다음 페이지 버튼)
  });

  it("단어장 조회 요청에 실패헀을 경우 서버 측 에러 메시지와 `재요청` 버튼을 렌더링한다.", async () => {
    const { getByRole, errorMessage: message } =
      renderVocabularyListCardListSection("/", true);

    await waitForElementToBeRemoved(document.querySelector(".animate-pulse"));

    const errorMessage = getByRole("heading", {
      name: message,
    });
    const refetchButton = getByRole("button", { name: "재요청" });

    expect(errorMessage).toBeInTheDocument();
    expect(refetchButton).toBeInTheDocument();
  });
});
