import {
  findByRole,
  render,
  waitFor,
  within,
} from "../../../common/utils/test-utils";
import { categories } from "../../../../mocks/handlers";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { CreateVocabularyListTemplate } from "../CreateVocabularyListTemplate";
import userEvent from "@testing-library/user-event";
import { server } from "../../../../mocks/server";
import { rest } from "msw";
import { ToastContainer } from "../../../toast/components/ToastContainer";

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
    server.use(
      rest.get(
        `${process.env.REACT_APP_API_URL}/categories`,
        (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              categories,
            })
          );
        }
      )
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("카테고리가 없다면 `/` url로 redirect된다.", async () => {
    renderCreateVocabularyTemplate([]);

    expect(window.location.pathname).toBe("/");
  });

  it("최초 렌더링 시 `단어장명` 필드와 `카테고리` 필드, 1개의 단어 추가를 위한 카드, `단어 추가` 버튼 및 `생성하기` 버튼을 띄운다.", () => {
    const { getByLabelText, getByRole, getAllByLabelText } =
      renderCreateVocabularyTemplate();

    const titleField = getByLabelText("단어장명");
    const selectCategoryField = getByRole("button", { name: "카테고리" });
    const englishField = getAllByLabelText("단어");
    const koreanField = getAllByLabelText("뜻");
    const addExampleButton = getAllByLabelText("예문 추가");
    const deleteVocabularyButton = getAllByLabelText("단어 삭제");
    const addVocabularyButton = getByRole("button", { name: "단어 추가" });
    const createButton = getByRole("button", { name: "생성하기" });

    expect(titleField).toBeInTheDocument();
    expect(selectCategoryField).toBeInTheDocument();
    expect(englishField).toHaveLength(1);
    expect(koreanField).toHaveLength(1);
    expect(addExampleButton).toHaveLength(1);
    expect(deleteVocabularyButton).toHaveLength(1);
    expect(addVocabularyButton).toBeInTheDocument();
    expect(createButton).toBeInTheDocument();
  });

  it("단어장 카드의 `예문 추가` 버튼을 클릭하면 해당 단어장 카드에 예문 및 해석 입력 필드가 추가된다.", async () => {
    const { getByLabelText, queryByLabelText } =
      renderCreateVocabularyTemplate();

    const addExampleButton = getByLabelText("예문 추가");

    expect(queryByLabelText("예문 1")).not.toBeInTheDocument();

    userEvent.click(addExampleButton);

    const exampleField = getByLabelText("예문 1");
    const translationField = getByLabelText("해석 1");
    const deleteExampleButton = getByLabelText("예문 삭제");

    expect(exampleField).toBeInTheDocument();
    expect(translationField).toBeInTheDocument();
    expect(deleteExampleButton).toBeInTheDocument();
  });

  it("예문 및 해석 입력 필드가 추가된 상태에서 `예문 삭제` 버튼을 클릭하면 해당 입력 필드가 제거된다.", () => {
    const { getByLabelText, queryByLabelText } =
      renderCreateVocabularyTemplate();

    const addExampleButton = getByLabelText("예문 추가");
    userEvent.click(addExampleButton);

    expect(getByLabelText("예문 1")).toBeInTheDocument();

    const deleteExampleButton = getByLabelText("예문 삭제");
    userEvent.click(deleteExampleButton);

    expect(queryByLabelText("예문 1")).not.toBeInTheDocument();
  });

  it("`단어 추가` 버튼을 클릭하면 새로운 단어 입력을 위한 카드가 생성된다.", () => {
    const { getByRole, queryByText, getByText, getAllByLabelText } =
      renderCreateVocabularyTemplate();

    const addVocabularyButton = getByRole("button", { name: "단어 추가" });

    expect(queryByText("2")).not.toBeInTheDocument();

    userEvent.click(addVocabularyButton);

    const secondVocabularyCard = getByText("2");
    const englishFields = getAllByLabelText("단어");
    const koreanFields = getAllByLabelText("뜻");

    expect(secondVocabularyCard).toBeInTheDocument();
    expect(englishFields).toHaveLength(2);
    expect(koreanFields).toHaveLength(2);
  });

  it("단어 카드를 모두 삭제하려고 하면 `단어장에는 최소 1개 이상의 단어가 있어야 합니다.` 메시지를 보여준다.", async () => {
    const { findByRole, queryByText, getByText, getByLabelText } =
      renderCreateVocabularyTemplate();

    const deleteVocabularyButton = getByLabelText("단어 삭제");

    userEvent.click(deleteVocabularyButton);

    const alertToast = await findByRole("alert");

    expect(alertToast).toHaveTextContent(
      "단어장에는 최소 1개 이상의 단어가 있어야 합니다."
    );
  });

  it("`단어장명` 필드를 입력하지 않고 `생성하기` 버튼을 누르면 `단어장명을 입력해주세요.` 메시지를 보여준다.", async () => {
    const { getByRole, getByLabelText, findByRole } =
      renderCreateVocabularyTemplate();

    const selectCategoryField = getByRole("button", { name: "카테고리" });
    const englishField = getByLabelText("단어");
    const koreanField = getByLabelText("뜻");
    const createButton = getByRole("button", { name: "생성하기" });

    userEvent.click(selectCategoryField);
    const selectListBox = within(await findByRole("listbox"));
    userEvent.click(selectListBox.getByText(categories[0].name));
    userEvent.type(englishField, "apple");
    userEvent.type(koreanField, "사과");
    userEvent.click(createButton);

    const titleAlertMessage = await findByRole("alert");
    expect(titleAlertMessage).toHaveTextContent("단어장명을 입력해주세요.");
  });

  it("`카테고리` 필드를 선택하지 않고 `생성하기` 버튼을 누르면 `카테고리를 선택해주세요.` 메시지를 보여준다.", async () => {
    const { getByRole, getByLabelText, findByRole } =
      renderCreateVocabularyTemplate();

    const titleField = getByLabelText("단어장명");
    const englishField = getByLabelText("단어");
    const koreanField = getByLabelText("뜻");
    const createButton = getByRole("button", { name: "생성하기" });

    userEvent.type(titleField, "토익 DAY-10");
    userEvent.type(englishField, "apple");
    userEvent.type(koreanField, "사과");
    userEvent.click(createButton);

    const selectCategoryAlertMessage = await findByRole("alert");
    expect(selectCategoryAlertMessage).toHaveTextContent(
      "카테고리를 선택해주세요."
    );
  });

  it("`단어` 필드를 입력하지 않고 `생성하기` 버튼을 누르면 `등록할 단어를 입력해주세요.` 메시지를 보여준다.", async () => {
    const { getByRole, getByLabelText, findByRole } =
      renderCreateVocabularyTemplate();

    const titleField = getByLabelText("단어장명");
    const selectCategoryField = getByRole("button", { name: "카테고리" });
    userEvent.click(selectCategoryField);
    const selectListBox = within(await findByRole("listbox"));
    const koreanField = getByLabelText("뜻");
    const createButton = getByRole("button", { name: "생성하기" });

    userEvent.type(titleField, "토익 DAY-10");
    userEvent.click(selectListBox.getByText(categories[0].name));
    userEvent.type(koreanField, "사과");
    userEvent.click(createButton);

    const englishAlertMessage = await findByRole("alert");
    expect(englishAlertMessage).toHaveTextContent(
      "등록할 단어를 입력해주세요."
    );
  });
  it("`뜻` 필드를 입력하지 않고 `생성하기` 버튼을 누르면 `단어의 뜻을 입력해주세요.` 메시지를 보여준다.", async () => {
    const { getByRole, getByLabelText, findByRole } =
      renderCreateVocabularyTemplate();

    const titleField = getByLabelText("단어장명");
    const selectCategoryField = getByRole("button", { name: "카테고리" });
    userEvent.click(selectCategoryField);
    const selectListBox = within(await findByRole("listbox"));
    const englishField = getByLabelText("단어");
    const createButton = getByRole("button", { name: "생성하기" });

    userEvent.type(titleField, "토익 DAY-10");
    userEvent.click(selectListBox.getByText(categories[0].name));
    userEvent.type(englishField, "apple");
    userEvent.click(createButton);

    const koreanAlertMessage = await findByRole("alert");
    expect(koreanAlertMessage).toHaveTextContent("단어의 뜻을 입력해주세요.");
  });

  it("`예문 1` 필드를 입력하지 않고 `생성하기` 버튼을 누르면 `예문을 입력해주세요.` 메세지를 보여준다.", async () => {
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
    const translationField = getByLabelText("해석 1");
    const createButton = getByRole("button", { name: "생성하기" });

    userEvent.type(titleField, "토익 DAY-10");
    userEvent.click(selectListBox.getByText(categories[0].name));
    userEvent.type(englishField, "apple");
    userEvent.type(koreanField, "사과");
    userEvent.type(translationField, "예문 해석");
    userEvent.click(createButton);

    const exampleAlertMessage = await findByRole("alert");
    expect(exampleAlertMessage).toHaveTextContent("예문을 입력해주세요.");
  });

  it("`해석 1` 필드를 입력하지 않고 `생성하기` 버튼을 누르면 `예문에 대한 해석을 입력해주세요.` 메시지를 보여준다.", async () => {
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
    const createButton = getByRole("button", { name: "생성하기" });

    userEvent.type(titleField, "토익 DAY-10");
    userEvent.click(selectListBox.getByText(categories[0].name));
    userEvent.type(englishField, "apple");
    userEvent.type(koreanField, "사과");
    userEvent.type(exampleField, "I have an apple.");
    userEvent.click(createButton);

    const exampleAlertMessage = await findByRole("alert");
    expect(exampleAlertMessage).toHaveTextContent(
      "예문에 대한 해석을 입력해주세요."
    );
  });

  it("서버 측 에러(500 에러)로 인해 단어장 생성에 실패하면 에러 메시지를 Toast를 통해 보여준다.", async () => {
    const serverErrorMessage = "Internal Server Error";
    server.use(
      rest.post(
        `${process.env.REACT_APP_API_URL}/vocabularies`,
        (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              status: 500,
              message: serverErrorMessage,
            })
          );
        }
      )
    );
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
    expect(alertToast).toHaveTextContent(serverErrorMessage);
  });

  it("카테고리 내 동일한 단어장명을 가진 단어장이 있어서(400 에러) 단어장 생성에 실패하면 에러 메시지를 Toast를 통해 보여준다.", async () => {
    const serverErrorMessage =
      "동일한 이름의 단어장이 카테고리 내에 존재합니다.";
    server.use(
      rest.post(
        `${process.env.REACT_APP_API_URL}/vocabularies`,
        (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              status: 400,
              message: serverErrorMessage,
            })
          );
        }
      )
    );
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
    expect(alertToast).toHaveTextContent(serverErrorMessage);
  });

  it("단어장 생성에 성공하면 `/` url로 redirect된다.", async () => {
    server.use(
      rest.post(
        `${process.env.REACT_APP_API_URL}/vocabularies`,
        (req, res, ctx) => {
          return res(
            ctx.status(201),
            ctx.json({
              status: 201,
            })
          );
        }
      )
    );
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

    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
    });
  });
});
