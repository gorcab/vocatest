import { rest } from "msw";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { server } from "../../../../mocks/server";
import { CategoryDto } from "../../../api/types";
import {
  render,
  waitForElementToBeRemoved,
} from "../../../common/utils/test-utils";
import { CategoryLinkList } from "../CategoryLinkList";

type ServerErrorResponse = {
  status: number;
  message: string;
};

describe("CategoryLinkList", () => {
  function getCategories() {
    const categories: Array<CategoryDto> = [
      { id: 1, name: "토익" },
      { id: 2, name: "텝스" },
      { id: 3, name: "토플" },
    ];

    return categories;
  }
  function renderCategoryLinkList(serverErrorResponse?: ServerErrorResponse) {
    const categories = getCategories();
    server.use(
      rest.get(
        `${process.env.REACT_APP_API_URL}/categories`,
        (req, res, ctx) => {
          if (serverErrorResponse) {
            return res(
              ctx.status(serverErrorResponse.status),
              ctx.json({
                status: serverErrorResponse.status,
                message: serverErrorResponse.message,
              })
            );
          } else {
            return res(
              ctx.status(200),
              ctx.json({
                categories,
              })
            );
          }
        }
      )
    );

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
    const { categories, getAllByRole } = renderCategoryLinkList();

    await waitForElementToBeRemoved(document.querySelector(".animate-pulse"));

    const categoryLinks = getAllByRole("link");

    expect(categoryLinks).toHaveLength(categories.length);
    categories.forEach((category, index) => {
      expect(categoryLinks[index]).toHaveTextContent(category.name);
    });
  });

  it("서버 측으로부터 카테고리 조회에 실패했으면 에러 메시지와 `재요청` 버튼을 렌더링한다.", async () => {
    const { getByRole } = renderCategoryLinkList({
      status: 500,
      message: "Internal Server Error",
    });

    await waitForElementToBeRemoved(document.querySelector(".animate-pulse"));

    const errorMessage = getByRole("alert");
    const retryButton = getByRole("button", { name: "재요청" });

    expect(errorMessage).toHaveTextContent("카테고리 조회 실패");
    expect(retryButton).toBeInTheDocument();
  });
});
