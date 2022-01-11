import { rest } from "msw";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  createEntireVocabularyLists,
  createMockVocabularyListsInEachCategory,
  getPageBasedEntireVocabularyLists,
  getQueryParamsFromRestRequest,
} from "../../../../mocks/handlers";
import { server } from "../../../../mocks/server";
import { DEFAULT_PER_PAGE } from "../../utils/constants";
import { render, waitForElementToBeRemoved } from "../../utils/test-utils";
import { VocabularyListSection } from "../VocabularyListSection";

describe("VocabularyListSection", () => {
  function renderVocabularyListSection(
    initialUrl: string,
    isBadRequest: boolean = false
  ) {
    window.history.replaceState({}, "", initialUrl);
    const mockVocabularyListsInEachCategory =
      createMockVocabularyListsInEachCategory();
    const entireVocabularyLists = createEntireVocabularyLists(
      mockVocabularyListsInEachCategory
    );
    server.use(
      rest.get(
        `${process.env.REACT_APP_API_URL}/vocabularies`,
        (req, res, ctx) => {
          if (isBadRequest) {
            return res(
              ctx.status(400),
              ctx.json({
                status: 400,
                message: "Bad Request",
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
    const portal = document.createElement("div");
    portal.classList.add("portal");
    const Component = (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VocabularyListSection />} />
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, getAllByRole } = render(Component, {
      container: document.body.appendChild(portal),
    });

    return {
      getByRole,
      getAllByRole,
      entireVocabularyLists,
    };
  }
  it("`/` url로 접속하면 `/?page=1&perPage=12`(default page, perPage) url로 리다이렉션된다.", () => {
    renderVocabularyListSection("/");

    const { pathname, search } = window.location;

    expect(pathname + search).toBe("/?page=1&perPage=12");
  });

  it("`perPage`만큼의 단어장들과 페이지네이션이 렌더링된다.", async () => {
    // given
    const { getAllByRole, entireVocabularyLists } =
      renderVocabularyListSection("/");
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

  it("단어장 조회 요청에 실패헀을 경우 `단어장 조회에 실패했습니다.` 메시지와 `재요청` 버튼을 렌더링한다.", async () => {
    const { getByRole } = renderVocabularyListSection("/", true);

    await waitForElementToBeRemoved(document.querySelector(".animate-pulse"));

    const errorMessage = getByRole("heading", {
      name: "단어장 조회에 실패했습니다.",
    });
    const refetchButton = getByRole("button", { name: "재요청" });

    expect(errorMessage).toBeInTheDocument();
    expect(refetchButton).toBeInTheDocument();
  });
});
