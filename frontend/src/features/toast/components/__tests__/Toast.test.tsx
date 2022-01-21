import { render } from "../../../common/utils/test-utils";
import { Toast } from "../Toast";

describe("Toast", () => {
  it("`닫기` 아이콘 버튼과 Toast type을 나타내는 아이콘, 메시지를 띄운다.", () => {
    const message = "에러 메시지";
    const { getByRole, getByText } = render(
      <Toast id="id" type="ERROR" desc={message} />
    );

    const closeIconButton = getByRole("button", { name: "닫기" });
    const icon = getByText("실패");
    const desc = getByText(message);

    expect(closeIconButton).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
    expect(desc).toBeInTheDocument();
  });
});
