import userEvent from "@testing-library/user-event";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DEFAULT_PER_PAGE } from "../../utils/constants";
import { render } from "../../utils/test-utils";
import { SearchVocabulariesFormModal } from "../SearchVocabulariesFormModal";

describe("SearchVocabulariesFormModal", () => {
  function renderSearchVocabulariesFormModal() {
    window.history.replaceState({}, "", "/");
    const closeModalHandler = jest.fn();
    const portal = document.createElement("div");
    portal.classList.add("portal");
    const Component = (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <SearchVocabulariesFormModal
                closeModalHandler={closeModalHandler}
                isOpen={true}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, getByPlaceholderText } = render(Component, {
      container: document.body.appendChild(portal),
    });

    return {
      getByRole,
      getByPlaceholderText,
      closeModalHandler,
    };
  }

  it("단어장을 검색할 수 있는 입력 필드와 닫기 버튼이 렌더링되고, 입력 필드에 포커싱된다.", () => {
    const { getByRole, getByPlaceholderText } =
      renderSearchVocabulariesFormModal();

    const searchField = getByPlaceholderText("단어장명을 입력해주세요.");
    const closeButton = getByRole("button", { name: "닫기" });

    expect(searchField).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
    expect(document.activeElement).toBe(searchField);
  });

  it("단어장을 입력 후 엔터 키를 누르면 `/page=1&perPage=${DEFAULT_PER_PAGE}&title=${title}` url로 이동하고 closeModalHandler가 호출된다.", async () => {
    const { getByPlaceholderText, closeModalHandler } =
      renderSearchVocabulariesFormModal();
    const title = "DAY-10";
    const searchField = getByPlaceholderText("단어장명을 입력해주세요.");

    userEvent.type(searchField, `${title}{enter}`);
    const { pathname, search } = window.location;

    expect(pathname + search).toBe(
      `/?page=1&perPage=${DEFAULT_PER_PAGE}&title=${title}`
    );
    expect(closeModalHandler).toBeCalled();
  });

  it("`닫기 아이콘` 버튼을 누르면 closeModalHandler가 호출된다.", () => {
    const { getByRole, closeModalHandler } =
      renderSearchVocabulariesFormModal();

    const closeButton = getByRole("button", { name: "닫기" });

    userEvent.click(closeButton);

    expect(closeModalHandler).toBeCalled();
  });
});
