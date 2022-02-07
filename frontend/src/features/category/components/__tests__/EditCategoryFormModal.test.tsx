import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { server } from "../../../../mocks/server";
import { CategoryDto } from "../../../api/types";
import { render, waitFor } from "../../../common/utils/test-utils";
import { EditCategoryFormModal } from "../EditCategoryFormModal";

describe("EditCategoryFormModal", () => {
  function renderEditCategoryFormModal() {
    const category: CategoryDto = {
      id: 1,
      name: "토익",
    };
    const onClose = jest.fn();
    const Component = (
      <EditCategoryFormModal
        isOpen={true}
        category={category}
        modalCloseHandler={onClose}
      />
    );
    const { getByRole, getByLabelText, findByRole } = render(Component);

    return {
      onClose,
      category,
      getByRole,
      getByLabelText,
      findByRole,
    };
  }

  afterEach(() => {
    server.resetHandlers();
  });

  it("`카테고리 수정하기` heading과 닫기 아이콘 버튼, `카테고리명` 입력 필드, `수정하기` 버튼을 렌더링한다.", () => {
    const { category, getByRole, getByLabelText } =
      renderEditCategoryFormModal();

    const heading = getByRole("heading", { name: "카테고리 수정하기" });
    const closeButton = getByRole("button", { name: "닫기" });
    const inputField = getByLabelText("카테고리명");
    const editButton = getByRole("button", { name: "수정하기" });

    expect(heading).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
    expect(inputField).toHaveValue(category.name);
    expect(editButton).toBeInTheDocument();
  });

  it("수정할 카테고리명을 입력하지 않고 `수정하기` 버튼을 누르면 `변경할 카테고리명을 입력해주세요.` 경고 메시지를 띄운다.", async () => {
    const { getByRole, getByLabelText, findByRole } =
      renderEditCategoryFormModal();

    const inputField = getByLabelText("카테고리명");
    const editButton = getByRole("button", { name: "수정하기" });

    userEvent.type(inputField, "{selectall}{del}");
    userEvent.click(editButton);

    const alertMessage = await findByRole("alert");

    expect(alertMessage).toHaveTextContent("변경할 카테고리명을 입력해주세요.");
  });

  it("공백으로만 구성된 카테고리명을 입력하고 `수정하기` 버튼을 누르면 `공백으로만 구성된 카테고리명은 사용할 수 없습니다.` 경고 메시지를 띄운다.", async () => {
    const { getByRole, getByLabelText, findByRole } =
      renderEditCategoryFormModal();

    const inputField = getByLabelText("카테고리명");
    const editButton = getByRole("button", { name: "수정하기" });

    userEvent.type(inputField, "{selectall}{del}   ");
    userEvent.click(editButton);

    const alertMessage = await findByRole("alert");

    expect(alertMessage).toHaveTextContent(
      "공백으로만 구성된 카테고리명은 사용할 수 없습니다."
    );
  });

  it("동일한 카테고리명이 입력된 상태에서 `수정하기` 버튼을 누르면 `동일한 카테고리명입니다.` 경고 메시지를 띄운다.", async () => {
    const { getByRole, findByRole } = renderEditCategoryFormModal();

    const editButton = getByRole("button", { name: "수정하기" });

    userEvent.click(editButton);

    const alertMessage = await findByRole("alert");

    expect(alertMessage).toHaveTextContent("동일한 카테고리명입니다.");
  });

  it("카테고리 수정이 완료되면 `onClose` 함수를 호출한다.", async () => {
    server.use(
      rest.patch(
        `${process.env.REACT_APP_API_URL}/categories/:id`,
        (req, res, ctx) => {
          return res(ctx.status(201));
        }
      )
    );

    const { onClose, getByRole, getByLabelText } =
      renderEditCategoryFormModal();

    const inputField = getByLabelText("카테고리명");
    const editButton = getByRole("button", { name: "수정하기" });

    userEvent.type(inputField, "{selectall}{del}TOEIC");
    userEvent.click(editButton);

    await waitFor(() => {
      expect(onClose).toBeCalled();
    });
  });

  it("카테고리 수정에 실패했을 경우 서버 측으로부터 받은 에러 메시지를 띄운다.", async () => {
    const message = "이미 존재하는 카테고리명입니다.";
    server.use(
      rest.patch(
        `${process.env.REACT_APP_API_URL}/categories/:id`,
        (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              status: 400,
              message,
            })
          );
        }
      )
    );

    const { onClose, getByRole, getByLabelText, findByRole } =
      renderEditCategoryFormModal();

    const inputField = getByLabelText("카테고리명");
    const editButton = getByRole("button", { name: "수정하기" });

    userEvent.type(inputField, "{selectall}{del}TOEIC");
    userEvent.click(editButton);

    const errorMessage = await findByRole("alert");

    expect(errorMessage).toHaveTextContent(message);
    expect(onClose).not.toBeCalled();
  });
});
