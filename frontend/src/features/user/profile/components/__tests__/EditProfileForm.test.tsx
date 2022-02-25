import userEvent from "@testing-library/user-event";
import { render, waitFor } from "features/common/utils/test-utils";
import { User } from "features/user/slice";
import { EditProfileForm } from "../EditProfileForm";

describe("EditProfileForm", () => {
  function renderEditProfileForm() {
    const isEditLoading = false;
    const onSubmit = jest.fn();
    const user: User = {
      id: 1,
      email: "tester@gmail.com",
      nickname: "tester",
    };

    const { getByRole, findByRole, getByLabelText } = render(
      <EditProfileForm
        onSubmit={onSubmit}
        user={user}
        isEditLoading={isEditLoading}
      />
    );

    return {
      getByRole,
      findByRole,
      getByLabelText,
      onSubmit,
      user,
    };
  }

  it("최초 렌더링 시 프로필 수정을 위함 폼 및 필드, `변경하기` 버튼을 렌더링한다.", () => {
    const { getByRole, getByLabelText, user } = renderEditProfileForm();

    const editProfileForm = getByRole("form", { name: "프로필 수정 폼" });
    const passwordField = getByLabelText("비밀번호");
    const newPasswordField = getByLabelText("새 비밀번호");
    const newPasswordConfirmField = getByLabelText("새 비밀번호 확인");
    const newNicknameField = getByLabelText("닉네임");
    const submitButton = getByRole("button", { name: "변경하기" });

    expect(editProfileForm).toBeInTheDocument();
    expect(passwordField).toBeInTheDocument();
    expect(newPasswordField).toBeInTheDocument();
    expect(newPasswordConfirmField).toBeInTheDocument();
    expect(newNicknameField).toHaveValue(user.nickname);
    expect(submitButton).toBeInTheDocument();
  });

  it("`비밀번호` 필드를 입력하지 않고 `변경하기` 버튼을 누르면 `비밀번호를 입력해주세요.` 메시지를 보여준다.", async () => {
    const { getByRole, getByLabelText, findByRole } = renderEditProfileForm();

    const newPasswordField = getByLabelText("새 비밀번호");
    const newPasswordConfirmField = getByLabelText("새 비밀번호 확인");
    const newNicknameField = getByLabelText("닉네임");
    const submitButton = getByRole("button", { name: "변경하기" });

    userEvent.type(newPasswordField, "newpwd1234");
    userEvent.type(newPasswordConfirmField, "newpwd1234");
    userEvent.type(newNicknameField, "tester1234");
    userEvent.click(submitButton);

    const alertMessage = await findByRole("alert");

    expect(alertMessage).toHaveTextContent("비밀번호를 입력해주세요.");
  });

  it("`비밀번호` 필드를 8자 미만으로 입력하고 `변경하기` 버튼을 누르면 `비밀번호는 최소 8자 이상이어야 합니다.` 메시지를 보여준다.", async () => {
    const { getByRole, getByLabelText, findByRole } = renderEditProfileForm();

    const passwordField = getByLabelText("비밀번호");
    const newPasswordField = getByLabelText("새 비밀번호");
    const newPasswordConfirmField = getByLabelText("새 비밀번호 확인");
    const newNicknameField = getByLabelText("닉네임");
    const submitButton = getByRole("button", { name: "변경하기" });

    userEvent.type(passwordField, "pwd1234");
    userEvent.type(newPasswordField, "newpwd1234");
    userEvent.type(newPasswordConfirmField, "newpwd1234");
    userEvent.type(newNicknameField, "tester1234");
    userEvent.click(submitButton);

    const alertMessage = await findByRole("alert");

    expect(alertMessage).toHaveTextContent(
      "비밀번호는 최소 8자 이상이어야 합니다."
    );
  });

  it("`비밀번호` 필드를 13자 이상으로 입력하고 `변경하기` 버튼을 누르면 `비밀번호는 최대 12자 이하여야 합니다.` 메시지를 보여준다.", async () => {
    const { getByRole, getByLabelText, findByRole } = renderEditProfileForm();

    const passwordField = getByLabelText("비밀번호");
    const newPasswordField = getByLabelText("새 비밀번호");
    const newPasswordConfirmField = getByLabelText("새 비밀번호 확인");
    const newNicknameField = getByLabelText("닉네임");
    const submitButton = getByRole("button", { name: "변경하기" });

    userEvent.type(passwordField, "newpassword1234");
    userEvent.type(newPasswordField, "newpwd1234");
    userEvent.type(newPasswordConfirmField, "newpwd1234");
    userEvent.type(newNicknameField, "tester1234");
    userEvent.click(submitButton);

    const alertMessage = await findByRole("alert");

    expect(alertMessage).toHaveTextContent(
      "비밀번호는 최대 12자 이하여야 합니다."
    );
  });

  it("`새 비밀번호` 필드를 입력하지 않고 `변경하기` 버튼을 누르면 `변경할 비밀번호를 입력해주세요.` 메시지를 보여준다.", async () => {
    const { getByRole, getByLabelText, findByRole } = renderEditProfileForm();

    const passwordField = getByLabelText("비밀번호");
    const newNicknameField = getByLabelText("닉네임");
    const submitButton = getByRole("button", { name: "변경하기" });

    userEvent.type(passwordField, "password");
    userEvent.type(newNicknameField, "tester1234");
    userEvent.click(submitButton);

    const alertMessage = await findByRole("alert");

    expect(alertMessage).toHaveTextContent("변경할 비밀번호를 입력해주세요.");
  });

  it("`새 비밀번호` 필드를 8자 미만으로 입력하고 `변경하기` 버튼을 누르면 `새 비밀번호는 최소 8자 이상이어야 합니다.` 메시지를 보여준다.", async () => {
    const { getByRole, getByLabelText, findByRole } = renderEditProfileForm();

    const passwordField = getByLabelText("비밀번호");
    const newPasswordField = getByLabelText("새 비밀번호");
    const newPasswordConfirmField = getByLabelText("새 비밀번호 확인");
    const newNicknameField = getByLabelText("닉네임");
    const submitButton = getByRole("button", { name: "변경하기" });

    userEvent.type(passwordField, "password");
    userEvent.type(newPasswordField, "newpwd1");
    userEvent.type(newPasswordConfirmField, "newpwd1");
    userEvent.type(newNicknameField, "tester1234");
    userEvent.click(submitButton);

    const alertMessage = await findByRole("alert");

    expect(alertMessage).toHaveTextContent(
      "새 비밀번호는 최소 8자 이상이어야 합니다."
    );
  });

  it("`새 비밀번호` 필드를 13자 이상으로 입력하고 `변경하기` 버튼을 누르면 `새 비밀번호는 최대 12자 이하여야 합니다.` 메시지를 보여준다.", async () => {
    const { getByRole, getByLabelText, findByRole } = renderEditProfileForm();

    const passwordField = getByLabelText("비밀번호");
    const newPasswordField = getByLabelText("새 비밀번호");
    const newPasswordConfirmField = getByLabelText("새 비밀번호 확인");
    const newNicknameField = getByLabelText("닉네임");
    const submitButton = getByRole("button", { name: "변경하기" });

    userEvent.type(passwordField, "password");
    userEvent.type(newPasswordField, "newpassword123");
    userEvent.type(newPasswordConfirmField, "newpassword123");
    userEvent.type(newNicknameField, "tester1234");
    userEvent.click(submitButton);

    const alertMessage = await findByRole("alert");

    expect(alertMessage).toHaveTextContent(
      "새 비밀번호는 최대 12자 이하여야 합니다."
    );
  });

  it("`새 비밀번호 확인` 필드를 `새 비밀번호` 필드와 동일하게 입력하지 않고 `변경하기` 버튼을 누르면 `새 비밀번호와 동일하게 입력해주세요.` 메시지를 보여준다.", async () => {
    const { getByRole, getByLabelText, findByRole } = renderEditProfileForm();

    const passwordField = getByLabelText("비밀번호");
    const newPasswordField = getByLabelText("새 비밀번호");
    const newPasswordConfirmField = getByLabelText("새 비밀번호 확인");
    const newNicknameField = getByLabelText("닉네임");
    const submitButton = getByRole("button", { name: "변경하기" });

    userEvent.type(passwordField, "password");
    userEvent.type(newPasswordField, "newpassword1");
    userEvent.type(newPasswordConfirmField, "newpassword12");
    userEvent.type(newNicknameField, "tester1234");
    userEvent.click(submitButton);

    const alertMessage = await findByRole("alert");

    expect(alertMessage).toHaveTextContent(
      "새 비밀번호와 동일하게 입력해주세요."
    );
  });

  it("`닉네임` 필드를 입력하지 않고 `변경하기` 버튼을 누르면 `변경할 닉네임을 입력해주세요.` 메시지를 보여준다.", async () => {
    const { getByRole, getByLabelText, findByRole } = renderEditProfileForm();

    const passwordField = getByLabelText("비밀번호");
    const newPasswordField = getByLabelText("새 비밀번호");
    const newPasswordConfirmField = getByLabelText("새 비밀번호 확인");
    const newNicknameField = getByLabelText("닉네임");
    const submitButton = getByRole("button", { name: "변경하기" });

    userEvent.type(passwordField, "password");
    userEvent.type(newPasswordField, "newpassword1");
    userEvent.type(newPasswordConfirmField, "newpassword1");
    userEvent.clear(newNicknameField);
    userEvent.click(submitButton);

    const alertMessage = await findByRole("alert");

    expect(alertMessage).toHaveTextContent("변경할 닉네임을 입력해주세요.");
  });

  it("`닉네임` 필드를 공백으로만 구성된 닉네임으로 입력한 뒤 `변경하기` 버튼을 누르면 `공백으로 구성된 닉네임은 사용할 수 없습니다.` 메시지를 보여준다.", async () => {
    const { getByRole, getByLabelText, findByRole } = renderEditProfileForm();

    const passwordField = getByLabelText("비밀번호");
    const newPasswordField = getByLabelText("새 비밀번호");
    const newPasswordConfirmField = getByLabelText("새 비밀번호 확인");
    const newNicknameField = getByLabelText("닉네임");
    const submitButton = getByRole("button", { name: "변경하기" });

    userEvent.type(passwordField, "password");
    userEvent.type(newPasswordField, "newpassword1");
    userEvent.type(newPasswordConfirmField, "newpassword1");
    userEvent.clear(newNicknameField);
    userEvent.type(newNicknameField, "   ");
    userEvent.click(submitButton);

    const alertMessage = await findByRole("alert");

    expect(alertMessage).toHaveTextContent(
      "공백으로 구성된 닉네임은 사용할 수 없습니다."
    );
  });

  it("모든 필드를 정상적으로 입력하고 `onSubmit` prop이 호출된다.", async () => {
    const { getByRole, getByLabelText, onSubmit } = renderEditProfileForm();

    const passwordField = getByLabelText("비밀번호");
    const newPasswordField = getByLabelText("새 비밀번호");
    const newPasswordConfirmField = getByLabelText("새 비밀번호 확인");
    const newNicknameField = getByLabelText("닉네임");
    const submitButton = getByRole("button", { name: "변경하기" });

    userEvent.type(passwordField, "password");
    userEvent.type(newPasswordField, "newpassword1");
    userEvent.type(newPasswordConfirmField, "newpassword1");
    userEvent.clear(newNicknameField);
    userEvent.type(newNicknameField, "newtester");
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toBeCalled();
    });
  });
});
