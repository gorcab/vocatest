import userEvent from "@testing-library/user-event";
import { render, waitFor, within } from "features/common/utils/test-utils";
import { ToastContainer } from "features/toast/components/ToastContainer";
import { mockCategories } from "mocks/lib/category.factory";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { VocabularyListForm } from "../VocabularyListForm";

describe("VocabularyListForm", () => {
  function renderVocabularyListForm() {
    window.history.replaceState({}, "", "/form-render");
    const submitHandler = jest.fn();
    const defaultValues = {
      title: "",
      categoryId: mockCategories[0].id,
      vocabularies: [{ english: "", korean: "", examples: [] }],
    };

    const Component = (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Outlet />}>
            <Route
              path="form-render"
              element={
                <>
                  <VocabularyListForm
                    categories={mockCategories}
                    defaultFieldValues={defaultValues}
                    type="create"
                    isMutationLoading={false}
                    submitHandler={submitHandler}
                  />
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
      getByLabelText,
      getAllByLabelText,
      queryByLabelText,
      queryAllByLabelText,
      findByRole,
      queryByText,
    } = render(Component);

    return {
      getByRole,
      getByLabelText,
      getAllByLabelText,
      queryByLabelText,
      queryAllByLabelText,
      findByRole,
      submitHandler,
      queryByText,

      defaultValues,
    };
  }

  it("최초 렌더링 시 `단어장명` 필드와 `카테고리` 필드, `defaultValues.vocabularies` 갯수만큼의 단어 필드, `단어 추가` 버튼 및 `생성하기` 버튼을 렌더링한다.", () => {
    const {
      getByRole,
      getByLabelText,
      getAllByLabelText,
      queryAllByLabelText,
      defaultValues,
    } = renderVocabularyListForm();
    const numOfExampleFields = defaultValues.vocabularies.reduce((acc, cur) => {
      return acc + cur.examples.length;
    }, 0);
    const titleField = getByLabelText("단어장명");
    const selectCategoryField = getByRole("button", { name: "카테고리" });
    const englishFields = getAllByLabelText("단어");
    const koreanFields = getAllByLabelText("뜻");
    const addExampleButton = getAllByLabelText("예문 추가");
    const exampleFields = queryAllByLabelText(/예문 \d+/);
    const deleteVocabularyButton = getAllByLabelText("단어 삭제");
    const addVocabularyButton = getByRole("button", { name: "단어 추가" });
    const createButton = getByRole("button", { name: "생성하기" });

    expect(titleField).toBeInTheDocument();
    expect(selectCategoryField).toBeInTheDocument();
    expect(englishFields).toHaveLength(defaultValues.vocabularies.length);
    expect(koreanFields).toHaveLength(defaultValues.vocabularies.length);
    expect(exampleFields).toHaveLength(numOfExampleFields);
    expect(addExampleButton).toHaveLength(defaultValues.vocabularies.length);
    expect(deleteVocabularyButton).toHaveLength(
      defaultValues.vocabularies.length
    );
    expect(addVocabularyButton).toBeInTheDocument();
    expect(createButton).toBeInTheDocument();
  });

  it("단어장 카드의 `예문 추가` 버튼을 클릭하면 해당 단어장 카드에 예문 및 해석 입력 필드가 추가된다.", async () => {
    const { getByLabelText, queryByLabelText, defaultValues } =
      renderVocabularyListForm();
    const firstAddExampleButton = getByLabelText("예문 추가");
    const nextExampleNum = defaultValues.vocabularies[0].examples.length + 1;
    expect(queryByLabelText(`예문 ${nextExampleNum}`)).not.toBeInTheDocument();

    userEvent.click(firstAddExampleButton);

    const exampleField = getByLabelText(`예문 ${nextExampleNum}`);
    const translationField = getByLabelText("해석 1");
    const deleteExampleButton = getByLabelText("예문 삭제");
    expect(exampleField).toBeInTheDocument();
    expect(translationField).toBeInTheDocument();
    expect(deleteExampleButton).toBeInTheDocument();
  });

  it("예문 및 해석 입력 필드가 추가된 상태에서 `예문 삭제` 버튼을 클릭하면 해당 입력 필드가 제거된다.", () => {
    const { getByLabelText, queryByLabelText, defaultValues } =
      renderVocabularyListForm();
    const firstAddExampleButton = getByLabelText("예문 추가");
    const nextExampleNum = defaultValues.vocabularies[0].examples.length + 1;
    userEvent.click(firstAddExampleButton);
    expect(getByLabelText(`예문 ${nextExampleNum}`)).toBeInTheDocument();
    const deleteExampleButton = getByLabelText("예문 삭제");

    userEvent.click(deleteExampleButton);

    expect(queryByLabelText(`예문 ${nextExampleNum}`)).not.toBeInTheDocument();
  });

  it("`단어 추가` 버튼을 클릭하면 새로운 단어 입력을 위한 카드가 생성된다.", () => {
    const { getByRole, queryByText, getAllByLabelText, defaultValues } =
      renderVocabularyListForm();
    const addVocabularyButton = getByRole("button", { name: "단어 추가" });
    const nextVocabularyNum = defaultValues.vocabularies.length + 1;
    expect(queryByText(nextVocabularyNum)).not.toBeInTheDocument();

    userEvent.click(addVocabularyButton);

    const secondVocabularyCard = queryByText(nextVocabularyNum);
    const englishFields = getAllByLabelText("단어");
    const koreanFields = getAllByLabelText("뜻");
    expect(secondVocabularyCard).toBeInTheDocument();
    expect(englishFields).toHaveLength(nextVocabularyNum);
    expect(koreanFields).toHaveLength(nextVocabularyNum);
  });

  it("단어 카드를 모두 삭제하려고 하면 `단어장에는 최소 1개 이상의 단어가 있어야 합니다.` 메시지를 보여준다.", async () => {
    const { findByRole, getByLabelText } = renderVocabularyListForm();
    const deleteVocabularyButton = getByLabelText("단어 삭제");

    userEvent.click(deleteVocabularyButton);

    const alertToast = await findByRole("alert");
    expect(alertToast).toHaveTextContent(
      "단어장에는 최소 1개 이상의 단어가 있어야 합니다."
    );
  });

  it("`단어장명` 필드를 입력하지 않고 `생성하기` 버튼을 누르면 `단어장명을 입력해주세요.` 메시지를 보여준다.", async () => {
    const { getByRole, getByLabelText, findByRole } =
      renderVocabularyListForm();
    const selectCategoryField = getByRole("button", { name: "카테고리" });
    const englishField = getByLabelText("단어");
    const koreanField = getByLabelText("뜻");
    const submitButton = getByRole("button", { name: "생성하기" });
    userEvent.click(selectCategoryField);
    const selectListBox = within(await findByRole("listbox"));
    userEvent.click(selectListBox.getByText(mockCategories[0].name));
    userEvent.type(englishField, "apple");
    userEvent.type(koreanField, "사과");

    userEvent.click(submitButton);

    const titleAlertMessage = await findByRole("alert");
    expect(titleAlertMessage).toHaveTextContent("단어장명을 입력해주세요.");
  });

  it("`단어` 필드를 입력하지 않고 `생성하기` 버튼을 누르면 `등록할 단어를 입력해주세요.` 메시지를 보여준다.", async () => {
    const { getByRole, getByLabelText, findByRole } =
      renderVocabularyListForm();
    const titleField = getByLabelText("단어장명");
    const selectCategoryField = getByRole("button", { name: "카테고리" });
    userEvent.click(selectCategoryField);
    const selectListBox = within(await findByRole("listbox"));
    const koreanField = getByLabelText("뜻");
    const submitButton = getByRole("button", { name: "생성하기" });
    userEvent.type(titleField, "토익 DAY-10");
    userEvent.click(selectListBox.getByText(mockCategories[0].name));
    userEvent.type(koreanField, "사과");

    userEvent.click(submitButton);

    const englishAlertMessage = await findByRole("alert");
    expect(englishAlertMessage).toHaveTextContent(
      "등록할 단어를 입력해주세요."
    );
  });

  it("`뜻` 필드를 입력하지 않고 `생성하기` 버튼을 누르면 `단어의 뜻을 입력해주세요.` 메시지를 보여준다.", async () => {
    const { getByRole, getByLabelText, findByRole } =
      renderVocabularyListForm();
    const titleField = getByLabelText("단어장명");
    const selectCategoryField = getByRole("button", { name: "카테고리" });
    userEvent.click(selectCategoryField);
    const selectListBox = within(await findByRole("listbox"));
    const englishField = getByLabelText("단어");
    const submitButton = getByRole("button", { name: "생성하기" });
    userEvent.type(titleField, "토익 DAY-10");
    userEvent.click(selectListBox.getByText(mockCategories[0].name));
    userEvent.type(englishField, "apple");

    userEvent.click(submitButton);

    const koreanAlertMessage = await findByRole("alert");
    expect(koreanAlertMessage).toHaveTextContent("단어의 뜻을 입력해주세요.");
  });

  it("`예문 1` 필드를 입력하지 않고 `생성하기` 버튼을 누르면 `예문을 입력해주세요.` 메세지를 보여준다.", async () => {
    const { getByRole, getByLabelText, findByRole } =
      renderVocabularyListForm();
    const addExampleButton = getByRole("button", { name: "예문 추가" });
    userEvent.click(addExampleButton);
    const titleField = getByLabelText("단어장명");
    const selectCategoryField = getByRole("button", { name: "카테고리" });
    userEvent.click(selectCategoryField);
    const selectListBox = within(await findByRole("listbox"));
    const englishField = getByLabelText("단어");
    const koreanField = getByLabelText("뜻");
    const translationField = getByLabelText("해석 1");
    const submitButton = getByRole("button", { name: "생성하기" });
    userEvent.type(titleField, "토익 DAY-10");
    userEvent.click(selectListBox.getByText(mockCategories[0].name));
    userEvent.type(englishField, "apple");
    userEvent.type(koreanField, "사과");
    userEvent.type(translationField, "예문 해석");

    userEvent.click(submitButton);

    const exampleAlertMessage = await findByRole("alert");
    expect(exampleAlertMessage).toHaveTextContent("예문을 입력해주세요.");
  });

  it("`해석 1` 필드를 입력하지 않고 `생성하기` 버튼을 누르면 `예문에 대한 해석을 입력해주세요.` 메시지를 보여준다.", async () => {
    const { getByRole, getByLabelText, findByRole } =
      renderVocabularyListForm();
    const addExampleButton = getByRole("button", { name: "예문 추가" });
    userEvent.click(addExampleButton);
    const titleField = getByLabelText("단어장명");
    const selectCategoryField = getByRole("button", { name: "카테고리" });
    userEvent.click(selectCategoryField);
    const selectListBox = within(await findByRole("listbox"));
    const englishField = getByLabelText("단어");
    const koreanField = getByLabelText("뜻");
    const exampleField = getByLabelText("예문 1");
    const submitButton = getByRole("button", { name: "생성하기" });
    userEvent.type(titleField, "토익 DAY-10");
    userEvent.click(selectListBox.getByText(mockCategories[0].name));
    userEvent.type(englishField, "apple");
    userEvent.type(koreanField, "사과");
    userEvent.type(exampleField, "I have an apple.");

    userEvent.click(submitButton);

    const exampleAlertMessage = await findByRole("alert");
    expect(exampleAlertMessage).toHaveTextContent(
      "예문에 대한 해석을 입력해주세요."
    );
  });

  it("필드를 모두 입력하고 submit 버튼을 누르면 `submitHandler` prop이 호출된다.", async () => {
    const { getByRole, getByLabelText, findByRole, submitHandler } =
      renderVocabularyListForm();
    const titleField = getByLabelText("단어장명");
    const selectCategoryField = getByRole("button", { name: "카테고리" });
    userEvent.click(selectCategoryField);
    const selectListBox = within(await findByRole("listbox"));
    const englishField = getByLabelText("단어");
    const koreanField = getByLabelText("뜻");
    const submitButton = getByRole("button", { name: "생성하기" });
    userEvent.type(titleField, "토익 DAY-10");
    userEvent.click(selectListBox.getByText(mockCategories[0].name));
    userEvent.type(englishField, "apple");
    userEvent.type(koreanField, "사과");

    userEvent.click(submitButton);

    await waitFor(() => {
      expect(submitHandler).toBeCalled();
    });
  });
});
