import userEvent from "@testing-library/user-event";
import { render, waitForElementToBeRemoved } from "../../utils/test-utils";
import { Tooltip } from "../Tooltip";

describe("Tooltip", () => {
  function renderTooltip() {
    const { getByLabelText, queryByRole, findByRole } = render(
      <Tooltip title="툴팁">
        <button>버튼</button>
      </Tooltip>
    );

    return {
      getByLabelText,
      findByRole,
      queryByRole,
    };
  }

  it("버튼을 hover하면 Tooltip이 렌더링된다.", async () => {
    const { getByLabelText, findByRole } = renderTooltip();
    const button = getByLabelText("툴팁");

    userEvent.hover(button);

    const tooltip = await findByRole("tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent("툴팁");
  });

  it("Tooltip이 렌더링된 상태에서 Esc 키를 누르면 Tooltip이 사라진다.", async () => {
    const { getByLabelText, queryByRole, findByRole } = renderTooltip();
    const button = getByLabelText("툴팁");
    userEvent.hover(button);
    expect(await findByRole("tooltip")).toBeInTheDocument();

    userEvent.keyboard("{Escape}");

    expect(queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("Tooltip이 렌더링된 상태에서 버튼을 unhover하면 Tooltip이 사라진다.", async () => {
    const { getByLabelText, queryByRole, findByRole } = renderTooltip();
    const button = getByLabelText("툴팁");
    userEvent.hover(button);
    expect(await findByRole("tooltip")).toBeInTheDocument();

    userEvent.unhover(button);

    await waitForElementToBeRemoved(() => queryByRole("tooltip"));
  });
});
