import userEvent from "@testing-library/user-event";
import { render } from "features/common/utils/test-utils";
import { Button } from "../Button";

describe("Button", () => {
  it("버튼을 렌더링한다.", () => {
    const { getByRole } = render(<Button type="submit">버튼</Button>);

    const button = getByRole("button", { name: "버튼" });

    expect(button).toBeInTheDocument();
  });

  it("클릭하면 onClick prop를 호출한다.", () => {
    const handleClick = jest.fn();
    const { getByRole } = render(
      <Button type="button" onClick={handleClick}>
        버튼
      </Button>
    );

    const button = getByRole("button", { name: "버튼" });

    userEvent.click(button);

    expect(handleClick).toBeCalled();
  });

  it("disabled 속성이 전달되면 disabled 상태가 된다.", () => {
    const { getByRole } = render(
      <Button type="submit" disabled={true}>
        버튼
      </Button>
    );

    const button = getByRole("button", { name: "버튼" });

    expect(button).toBeDisabled();
  });
});
