import { BrowserRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { DEFAULT_PER_PAGE } from "features/common/utils/constants";
import { CategoryDto } from "features/api/types";
import { VocabularyListCard } from "../VocabularyListCard";
import { render } from "features/common/utils/test-utils";
import { getFormattedDate } from "features/common/utils/helper";
import { mockCategories } from "mocks/lib/category.factory";

describe("VocabularyListCard", () => {
  function renderVocabularyListCard() {
    const page = 1;
    const perPage = DEFAULT_PER_PAGE;
    const category = mockCategories[0];
    const vocabularyListId = 1;
    const title = `토익 DAY-10`;
    const createdAt = new Date().toISOString();
    const numOfVocabularies = 20;

    const Component = (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <VocabularyListCard
                id={vocabularyListId}
                category={category}
                createdAt={createdAt}
                numOfVocabularies={numOfVocabularies}
                title={title}
              />
            }
          >
            <Route
              path="vocabularies/:id"
              element={<div>단어장 상세 페이지</div>}
            />
            <Route
              path="categories/:id"
              element={<div>카테고리 상세 페이지</div>}
            />
            <Route
              path="edit-vocabulary/:id"
              element={<div>단어장 수정 페이지</div>}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, getByText, findAllByRole, findByRole } =
      render(Component);

    return {
      getByRole,
      getByText,
      findAllByRole,
      findByRole,
      page,
      perPage,
      vocabularyListId,
      title,
      createdAt,
      category,
      numOfVocabularies,
    };
  }

  beforeEach(() => {
    window.history.replaceState({}, "", `/?page=1&perPage=${DEFAULT_PER_PAGE}`);
  });

  it("단어장 이름, 생성 날짜, 단어 갯수, 단어장 수정 및 삭제 드롭다운 메뉴를 열기 위한 버튼을 렌더링한다.", () => {
    const { getByRole, getByText, title, createdAt, numOfVocabularies } =
      renderVocabularyListCard();

    const vocabularyListTitle = getByRole("heading", { name: title });
    const createdDate = getByText(getFormattedDate(new Date(createdAt)));
    const nums = getByText(`${numOfVocabularies} 단어`);
    const dropdownButton = getByRole("button", { expanded: false });

    expect(vocabularyListTitle).toBeInTheDocument();
    expect(createdDate).toBeInTheDocument();
    expect(nums).toBeInTheDocument();
    expect(dropdownButton).toBeInTheDocument();
  });

  it("드롭다운 메뉴를 클릭하면 단어장 수정과 단어장 삭제 메뉴 아이템이 나타난다.", async () => {
    const { getByRole, findAllByRole } = renderVocabularyListCard();

    const dropdownButton = getByRole("button", { expanded: false });

    userEvent.click(dropdownButton);

    const menuItems = await findAllByRole("menuitem");

    expect(menuItems).toHaveLength(2);
    expect(menuItems[0]).toHaveTextContent("단어장 삭제");
    expect(menuItems[1]).toHaveTextContent("단어장 수정");
  });

  it("단어장 카드 링크를 누르면 `/vocabularies/:id` url로 이동한다.", () => {
    const { getByRole, vocabularyListId, title } = renderVocabularyListCard();
    const cardLink = getByRole("link", { name: new RegExp(`${title}`, "g") });

    userEvent.click(cardLink);

    expect(window.location.pathname).toBe(`/vocabularies/${vocabularyListId}`);
  });

  it("단어장 내 카테고리 링크를 누르면 `/?page=1&perPage=${perPage}&category=${categoryId}` url로 이동한다.", () => {
    const { getByRole, category } = renderVocabularyListCard();
    const categoryLink = getByRole("link", { name: category.name });

    userEvent.click(categoryLink);

    expect(window.location.pathname + window.location.search).toBe(
      `/?page=1&perPage=${DEFAULT_PER_PAGE}&category=${category.id}`
    );
  });

  it("드롭다운 메뉴의 `단어장 삭제` 메뉴를 클릭하면 단어장 삭제 모달이 나타난다.", async () => {
    const { getByRole, findByRole } = renderVocabularyListCard();
    const dropdownButton = getByRole("button", { expanded: false });
    userEvent.click(dropdownButton);
    const deleteModalOpenButton = await findByRole("menuitem", {
      name: "단어장 삭제",
    });

    userEvent.click(deleteModalOpenButton);

    const deleteModal = await findByRole("dialog");

    expect(deleteModal).toHaveTextContent(/단어장 삭제/);
  });

  it("드롭다운 메뉴의 `단어장 수정` 메뉴를 클릭하면 `/edit-vocabulary/:id` url로 이동한다.`", async () => {
    const { getByRole, findByRole, vocabularyListId } =
      renderVocabularyListCard();
    const dropdownButton = getByRole("button", { expanded: false });
    userEvent.click(dropdownButton);
    const editVocabularyButton = await findByRole("menuitem", {
      name: "단어장 수정",
    });

    userEvent.click(editVocabularyButton);

    expect(window.location.pathname).toBe(
      `/edit-vocabulary/${vocabularyListId}`
    );
  });
});
