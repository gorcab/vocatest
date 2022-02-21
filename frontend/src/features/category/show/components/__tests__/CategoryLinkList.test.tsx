import { waitForElementToBeRemoved } from "@testing-library/dom";
import { render } from "features/common/utils/test-utils";
import { mockCategories } from "mocks/lib/category.factory";
import {
  failToGetCategoriesResponse,
  successToGetCategoriesResponse,
} from "mocks/test/category.mock";
import { server } from "mocks/test/server";
import { rest } from "msw";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CategoryLinkList } from "../CategoryLinkList";

type ServerErrorResponse = {
  status: number;
  message: string;
};

describe("CategoryLinkList", () => {
  function renderCategoryLinkList() {
    const categories = mockCategories;

    const Component = (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CategoryLinkList />} />
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, getAllByRole } = render(Component);

    return {
      categories,
      getAllByRole,
      getByRole,
    };
  }

  afterEach(() => {
    server.resetHandlers();
  });

  it("서버로부터 카테고리를 조회하여 해당 카테고리들을 CategoryLinkItem으로 렌더링한다.", async () => {
    server.use(successToGetCategoriesResponse);
    const { categories, getAllByRole } = renderCategoryLinkList();

    await waitForElementToBeRemoved(document.querySelector(".animate-pulse"));

    const categoryLinks = getAllByRole("link");

    expect(categoryLinks).toHaveLength(categories.length);
    categories.forEach((category, index) => {
      expect(categoryLinks[index]).toHaveTextContent(category.name);
    });
  });

  it("서버 측으로부터 카테고리 조회에 실패했으면 에러 메시지와 `재요청` 버튼을 렌더링한다.", async () => {
    server.use(failToGetCategoriesResponse);
    const { getByRole } = renderCategoryLinkList();

    await waitForElementToBeRemoved(document.querySelector(".animate-pulse"));

    const errorMessage = getByRole("alert");
    const retryButton = getByRole("button", { name: "재요청" });

    expect(errorMessage).toHaveTextContent("카테고리 조회 실패");
    expect(retryButton).toBeInTheDocument();
  });
});
