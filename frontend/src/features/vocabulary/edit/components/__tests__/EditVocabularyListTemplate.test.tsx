import userEvent from "@testing-library/user-event";
import { render, waitFor } from "features/common/utils/test-utils";
import { ToastContainer } from "features/toast/components/ToastContainer";
import { mockCategories } from "mocks/lib/category.factory";
import {
  createMockVocabularyListsInEachCategory,
  getEntireVocabularyLists,
} from "mocks/lib/vocabulary.factory";
import { server } from "mocks/test/server";
import { successToGetUserProfileResponse } from "mocks/test/user.mock";
import {
  clientErrorForEditingVocabularyListResponse,
  successToEditVocabularyListResponse,
  serverErrorForEditingVocabularyListResponse,
  successToGetDetailedVocabularyListResponse,
} from "mocks/test/vocabulary.mock";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { EditVocabularyListTemplate } from "../EditVocabularyListTemplate";

describe("EditVocabularyListTemplate", () => {
  const vocabularyListsRecord = createMockVocabularyListsInEachCategory();
  const entireVocabularyLists = getEntireVocabularyLists(vocabularyListsRecord);
  const categories = mockCategories;
  const vocabularyList = entireVocabularyLists[0];

  function renderEditVocabularyListTemplate() {
    window.history.replaceState(
      {},
      "",
      `/edit-vocabulary/${vocabularyList.id}`
    );

    const Component = (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Outlet />}>
            <Route
              path="edit-vocabulary/:id"
              element={
                <>
                  <EditVocabularyListTemplate
                    categories={categories}
                    vocabularyList={vocabularyList}
                  />
                  <ToastContainer />
                </>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, findByRole } = render(Component);

    return {
      getByRole,
      findByRole,
    };
  }

  beforeEach(() => {
    server.use(successToGetDetailedVocabularyListResponse(vocabularyList));
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it("최초 렌더링 시 단어장 수정을 위함 폼을 렌더링한다.", () => {
    const { getByRole } = renderEditVocabularyListTemplate();

    const editVocabularyListForm = getByRole("form", {
      name: "단어장 수정 폼",
    });

    expect(editVocabularyListForm);
  });

  it("4XX 에러로 인해 단어장 수정에 실패하면 Toast를 통해 서버 측으로부터 받은 에러 메시지를 보여준다.", async () => {
    server.use(
      ...[
        successToGetUserProfileResponse,
        clientErrorForEditingVocabularyListResponse,
      ]
    );
    const { getByRole } = renderEditVocabularyListTemplate();

    const editButton = getByRole("button", { name: "수정하기" });

    userEvent.click(editButton);

    await waitFor(() => {
      expect(getByRole("alert")).toHaveTextContent(
        "올바르지 않은 단어장입니다."
      );
    });
  });

  it("5XX 에러로 인해 단어장 수정에 실패하면 Toast를 통해 `서버 측 에러로 인해 단어장 수정에 실패했습니다. 잠시 후에 다시 시도해주세요.` 메시지를 보여준다.", async () => {
    server.use(
      ...[
        successToGetUserProfileResponse,
        serverErrorForEditingVocabularyListResponse,
      ]
    );
    const { getByRole } = renderEditVocabularyListTemplate();
    const editButton = getByRole("button", { name: "수정하기" });

    userEvent.click(editButton);

    await waitFor(() => {
      expect(getByRole("alert")).toHaveTextContent(
        "서버 측 에러로 인해 단어장 수정에 실패했습니다. 잠시 후에 다시 시도해주세요."
      );
    });
  });

  it("단어장 수정에 성공하면 메인 페이지로 돌아간다.", async () => {
    server.use(
      ...[successToGetUserProfileResponse, successToEditVocabularyListResponse]
    );
    const { getByRole } = renderEditVocabularyListTemplate();
    const editButton = getByRole("button", { name: "수정하기" });

    userEvent.click(editButton);

    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
    });
  });
});
