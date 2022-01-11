import { useMemo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export type PaginationProps = {
  currentPage: number;
  totalItems: number;
  numOfItemsPerPage: number;
  numOfPagesToShow?: number;
  onPageChange: (clickedPage: number) => void;
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  numOfItemsPerPage,
  numOfPagesToShow = 5,
  onPageChange,
}) => {
  const totalPage = useMemo(() => {
    return Math.ceil(totalItems / numOfItemsPerPage);
  }, [totalItems, numOfItemsPerPage]);
  const hasNext = () => currentPage < totalPage;
  const hasPrev = () => currentPage > 1;
  const prevButtonClick = () => {
    if (hasPrev()) {
      onPageChange(currentPage - 1);
    }
  };

  const nextButtonClick = () => {
    if (hasNext()) {
      onPageChange(currentPage + 1);
    }
  };

  const pageButtonClick = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  const firstPageToShow =
    Math.ceil((currentPage - numOfPagesToShow) / numOfPagesToShow) *
      numOfPagesToShow +
    1;
  const lastPageToShow =
    firstPageToShow + numOfPagesToShow > totalPage
      ? totalPage
      : firstPageToShow + numOfPagesToShow - 1;

  return (
    <ul className="flex items-center">
      <li>
        <button
          disabled={currentPage === 1}
          className={`flex justify-center items-center ${
            hasPrev()
              ? "text-black hover:text-blue-500"
              : "text-slate-500 cursor-not-allowed"
          }`}
          type="button"
          onClick={prevButtonClick}
        >
          <FaChevronLeft width={25} height={25} />
          <span className="sr-only">이전 페이지로 가기</span>
        </button>
      </li>

      {Array.from({ length: lastPageToShow - firstPageToShow + 1 }).map(
        (_, index) => (
          <li key={firstPageToShow + index}>
            <button
              onClick={() => pageButtonClick(firstPageToShow + index)}
              className={`${
                firstPageToShow + index === currentPage
                  ? "text-blue-500"
                  : "text-black"
              } flex justify-center items-center p-2 hover:text-blue-500`}
            >
              {firstPageToShow + index}
            </button>
          </li>
        )
      )}

      <li>
        <button
          type="button"
          disabled={currentPage === totalPage}
          onClick={nextButtonClick}
          className={`flex justify-center items-center ${
            hasNext()
              ? "text-black hover:text-blue-500"
              : "text-slate-500 cursor-not-allowed"
          }`}
        >
          <FaChevronRight width={25} height={25} />
          <span className="sr-only">다음 페이지로 가기</span>
        </button>
      </li>
    </ul>
  );
};
