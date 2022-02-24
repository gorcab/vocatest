import userEvent from "@testing-library/user-event";
import { render, waitFor, within } from "features/common/utils/test-utils";
import { ToastContainer } from "features/toast/components/ToastContainer";
import { mockCategories as categories } from "mocks/lib/category.factory";
import { successToGetCategoriesResponse } from "mocks/test/category.mock";

import { server } from "mocks/test/server";
import {
  failToCreateVocabularyResponse,
  serverErrorForCreatingVocabularyResponse,
  successToCreateVocabularyResponse,
} from "mocks/test/vocabulary.mock";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { CreateVocabularyListTemplate } from "../CreateVocabularyListTemplate";

describe("CreateVocabularyListTemplate", () => {
  function renderCreateVocabularyTemplate(categoriesProps = categories) {
    window.history.replaceState({}, "", "/create-vocabulary");

    const Component = (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Outlet />}>
            <Route
              path="create-vocabulary"
              element={
                <>
                  <CreateVocabularyListTemplate categories={categoriesProps} />
                  <ToastContainer />
                </>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    const {
      getByRole,
      getByText,
      findByRole,
      getByLabelText,
      getAllByLabelText,
      findByLabelText,
      queryByText,
      queryByLabelText,
      debug,
    } = render(Component);

    return {
      getByRole,
      getByText,
      findByRole,
      getByLabelText,
      getAllByLabelText,
      findByLabelText,
      queryByLabelText,
      queryByText,
      debug,
    };
  }

  beforeEach(() => {
    server.use(successToGetCategoriesResponse);
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("4XX 에러로 인해 단어장 생성에 실패하면 서버 측으로부터 받은 에러 메시지를 Toast를 통해 보여준다.", async () => {
    server.use(failToCreateVocabularyResponse);
    const { getByRole, getByLabelText, findByRole } =
      renderCreateVocabularyTemplate();
    const titleField = getByLabelText("단어장명");
    const selectCategoryField = getByRole("button", { name: "카테고리" });
    userEvent.click(selectCategoryField);
    const selectListBox = within(await findByRole("listbox"));
    const englishField = getByLabelText("단어");
    const koreanField = getByLabelText("뜻");
    const createButton = getByRole("button", { name: "생성하기" });
    userEvent.type(titleField, "토익 DAY-10");
    userEvent.click(selectListBox.getByText(categories[0].name));
    userEvent.type(englishField, "apple");
    userEvent.type(koreanField, "사과");

    userEvent.click(createButton);

    const alertToast = await findByRole("alert");
    expect(alertToast).toHaveTextContent(
      "동일한 이름의 단어장이 카테고리 내에 존재합니다."
    );
  });

  it("서버 측 에러(500 에러)로 인해 단어장 생성에 실패하면 에러 메시지를 Toast를 통해 보여준다.", async () => {
    server.use(serverErrorForCreatingVocabularyResponse);
    const { getByRole, getByLabelText, findByRole } =
      renderCreateVocabularyTemplate();
    const addExampleButton = getByRole("button", { name: "예문 추가" });
    userEvent.click(addExampleButton);
    const titleField = getByLabelText("단어장명");
    const selectCategoryField = getByRole("button", { name: "카테고리" });
    userEvent.click(selectCategoryField);
    const selectListBox = within(await findByRole("listbox"));
    const englishField = getByLabelText("단어");
    const koreanField = getByLabelText("뜻");
    const exampleField = getByLabelText("예문 1");
    const translationField = getByLabelText("해석 1");
    const createButton = getByRole("button", { name: "생성하기" });
    userEvent.type(titleField, "토익 DAY-10");
    userEvent.click(selectListBox.getByText(categories[0].name));
    userEvent.type(englishField, "apple");
    userEvent.type(koreanField, "사과");
    userEvent.type(exampleField, "I have an apple.");
    userEvent.type(translationField, "나는 사과 한 개를 가지고 있습니다.");

    userEvent.click(createButton);

    const alertToast = await findByRole("alert");
    expect(alertToast).toHaveTextContent(
      "서버 측 에러로 인해 단어장 생성에 실패했습니다. 잠시 후에 다시 시도해주세요."
    );
  });

  it("단어장 생성에 성공하면 `/` url로 redirect된다.", async () => {
    server.use(successToCreateVocabularyResponse);
    const { getByRole, getByLabelText, findByRole } =
      renderCreateVocabularyTemplate();
    const titleField = getByLabelText("단어장명");
    const selectCategoryField = getByRole("button", { name: "카테고리" });
    userEvent.click(selectCategoryField);
    const selectListBox = within(await findByRole("listbox"));
    const englishField = getByLabelText("단어");
    const koreanField = getByLabelText("뜻");
    const createButton = getByRole("button", { name: "생성하기" });
    userEvent.type(titleField, "토익 DAY-10");
    userEvent.click(selectListBox.getByText(categories[0].name));
    userEvent.type(englishField, "apple");
    userEvent.type(koreanField, "사과");

    userEvent.click(createButton);

    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
    });
  });
});
