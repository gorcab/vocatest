import userEvent from "@testing-library/user-event";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { render } from "../../utils/test-utils";
import { Pagination } from "../Pagination";

describe("Pagination", () => {
  function renderPagination({
    currentPage,
    numOfItemsPerPage,
    totalItems,
    numOfPagesToShow,
  }: {
    currentPage: number;
    totalItems: number;
    numOfItemsPerPage: number;
    numOfPagesToShow: number;
  }) {
    window.history.replaceState({}, "", "/");
    const pageChangeHandler = jest.fn();
    const Component = (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                numOfItemsPerPage={numOfItemsPerPage}
                numOfPagesToShow={numOfPagesToShow}
                onPageChange={pageChangeHandler}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    );
    const { getByRole, getAllByRole, findAllByRole, debug } = render(Component);

    return {
      getByRole,
      getAllByRole,
      pageChangeHandler,
      findAllByRole,
      debug,
    };
  }
  it.each([
    [1, 10, 61, 5, 1, 5],
    [2, 20, 100, 5, 1, 5],
    [4, 10, 39, 3, 4, 4],
    [6, 5, 40, 5, 6, 8],
  ])(
    "현재 페이지가 %s, 한 페이지 당 보여줄 아이템의 갯수가 %s, 전체 아이템 갯수가 %s, 보여지는 페이지 단위가 %s일 때, `이전 페이지로 가기 아이콘` 버튼, 보여질 페이지 버튼들, `다음 페이지로 가기 아이콘` 버튼을 렌더링한다.",
    (
      currentPage,
      numOfItemsPerPage,
      totalItems,
      numOfPagesToShow,
      firstPageToShow,
      lastPageToShow
    ) => {
      const { getByRole, getAllByRole } = renderPagination({
        currentPage,
        numOfItemsPerPage,
        totalItems,
        numOfPagesToShow,
      });

      const prevButton = getByRole("button", { name: "이전 페이지로 가기" });
      const nextButton = getByRole("button", { name: "다음 페이지로 가기" });
      const pageButtons = getAllByRole("button", {
        name: new RegExp(`[${firstPageToShow}-${lastPageToShow}]`),
      });

      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
      expect(pageButtons).toHaveLength(lastPageToShow - firstPageToShow + 1);
    }
  );

  it("1 페이지에선 `이전 페이지로 가기 아이콘` 버튼이 disabled 상태이다.", () => {
    const { getByRole } = renderPagination({
      currentPage: 1,
      numOfItemsPerPage: 10,
      totalItems: 60,
      numOfPagesToShow: 5,
    });

    const prevButton = getByRole("button", { name: "이전 페이지로 가기" });

    expect(prevButton).toBeDisabled();
  });

  it("마지막 페이지에선 `다음 페이지로 가기 아이콘` 버튼이 disabled 상태이다.", () => {
    const { getByRole } = renderPagination({
      currentPage: 6,
      numOfItemsPerPage: 10,
      totalItems: 60,
      numOfPagesToShow: 5,
    });

    const nextButton = getByRole("button", { name: "다음 페이지로 가기" });

    expect(nextButton).toBeDisabled();
  });

  it("페이지 버튼을 클릭하면 pageChangeHandler가 누른 페이지를 인자로 받아 호출된다", () => {
    const { getByRole, pageChangeHandler } = renderPagination({
      currentPage: 1,
      numOfItemsPerPage: 10,
      totalItems: 60,
      numOfPagesToShow: 5,
    });

    const page2Button = getByRole("button", { name: "2" });

    userEvent.click(page2Button);

    expect(pageChangeHandler).toBeCalledWith(2);
  });

  it("`이전 페이지로 가기 아이콘` 버튼을 클릭하면 이전 페이지를 인자로 받아 pageChangeHandler가 호출된다.", () => {
    const { getByRole, pageChangeHandler } = renderPagination({
      currentPage: 4,
      numOfItemsPerPage: 10,
      totalItems: 60,
      numOfPagesToShow: 5,
    });

    const prevButton = getByRole("button", { name: "이전 페이지로 가기" });

    userEvent.click(prevButton);

    expect(pageChangeHandler).toBeCalledWith(3);
  });

  it("`다음 페이지로 가기 아이콘` 버튼을 클릭하면 다음 페이지를 인자로 받아 pageChangeHandler가 호출된다.", () => {
    const { getByRole, pageChangeHandler } = renderPagination({
      currentPage: 2,
      numOfItemsPerPage: 10,
      totalItems: 60,
      numOfPagesToShow: 5,
    });

    const nextButton = getByRole("button", { name: "다음 페이지로 가기" });

    userEvent.click(nextButton);

    expect(pageChangeHandler).toBeCalledWith(3);
  });
});
