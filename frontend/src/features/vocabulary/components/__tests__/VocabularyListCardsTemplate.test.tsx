import { rest } from "msw";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import {
  createEntireVocabularyLists,
  createMockVocabularyListsInEachCategory,
  getPageBasedEntireVocabularyLists,
} from "../../../../mocks/handlers";
import { server } from "../../../../mocks/server";
import { PagedVocabularyListsRequest } from "../../../api/types";
import {
  render,
  waitForElementToBeRemoved,
  within,
} from "../../../common/utils/test-utils";
import { VocabularyListCardsTemplate } from "../VocabularyListCardsTemplate";

describe("VocabularyListCardsTemplate", () => {
  const pagedVocabularyListsRequest: PagedVocabularyListsRequest = {
    page: 1,
    perPage: 12,
  };

  function renderVocabularyListCardsTemplate() {
    const portal = document.createElement("div");
    portal.classList.add("portal");
    const Component = (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <VocabularyListCardsTemplate
                  pagedVocabularyListsRequest={pagedVocabularyListsRequest}
                />
                <Outlet />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, findAllByRole, findByRole } = render(Component, {
      container: document.body.appendChild(portal),
    });

    return {
      getByRole,
      findAllByRole,
      findByRole,
    };
  }

  afterEach(() => {
    server.resetHandlers();
  });

  it("서버로부터 단어장을 응답으로 받으면 해당 단어장들과 Pagination을 보여준다.", async () => {
    // given
    const mockVocabularyLists = createMockVocabularyListsInEachCategory();
    const entireVocabularyLists =
      createEntireVocabularyLists(mockVocabularyLists);
    server.use(
      rest.get(
        `${process.env.REACT_APP_API_URL}/vocabularies`,
        (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              ...getPageBasedEntireVocabularyLists(
                entireVocabularyLists,
                pagedVocabularyListsRequest.page,
                pagedVocabularyListsRequest.perPage
              ),
            })
          );
        }
      )
    );

    const { getByRole, findAllByRole } = renderVocabularyListCardsTemplate();

    // when
    await waitForElementToBeRemoved(document.querySelector(".animate-pulse"));

    const allListItems = await findAllByRole("listitem");
    const paginationItems = within(getByRole("navigation")).getAllByRole(
      "listitem"
    );
    const vocabularyListCards = allListItems.filter(
      (listItem) => !paginationItems.includes(listItem)
    );
    const activePageButton = getByRole("button", {
      name: pagedVocabularyListsRequest.page.toString(),
    });

    // then
    expect(vocabularyListCards).toHaveLength(
      entireVocabularyLists.length < pagedVocabularyListsRequest.perPage
        ? entireVocabularyLists.length
        : pagedVocabularyListsRequest.perPage
    );
    expect(activePageButton).toHaveClass("text-blue-500 font-extrabold");
  });

  it("서버 측으로부터 단어장 조회를 실패했으면 에러 메시지를 보여준다.", async () => {
    const message = "Internal Server Error";
    server.use(
      rest.get(
        `${process.env.REACT_APP_API_URL}/vocabularies`,
        (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              status: 500,
              message,
            })
          );
        }
      )
    );

    const { getByRole } = renderVocabularyListCardsTemplate();

    await waitForElementToBeRemoved(document.querySelector(".animate-pulse"));

    const errorMessage = getByRole("alert");
    const retryButton = getByRole("button", { name: "재요청" });

    expect(errorMessage).toHaveTextContent(message);
    expect(retryButton).toBeInTheDocument();
  });
});
