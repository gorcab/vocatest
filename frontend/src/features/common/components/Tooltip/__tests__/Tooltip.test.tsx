import userEvent from "@testing-library/user-event";
import {
  fireEvent,
  render,
  waitForElementToBeRemoved,
} from "features/common/utils/test-utils";
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

  it("Tooltip이 렌더링된 상태에서 버튼을 누르면 Tooltip이 사라진다.", async () => {
    const { getByLabelText, findByRole } = renderTooltip();
    const button = getByLabelText("툴팁");
    userEvent.hover(button);
    const tooltip = await findByRole("tooltip");
    expect(tooltip).toBeInTheDocument();

    fireEvent.mouseDown(button);

    expect(tooltip).not.toBeInTheDocument();
  });

  it("Tooltip이 렌더링된 상태에서 버튼을 클릭하면 Tooltip이 사라진다.", async () => {
    const { getByLabelText, findByRole } = renderTooltip();
    const button = getByLabelText("툴팁");
    userEvent.hover(button);
    const tooltip = await findByRole("tooltip");
    expect(tooltip).toBeInTheDocument();

    userEvent.click(button);

    expect(tooltip).not.toBeInTheDocument();
  });

  it("버튼이 포커싱되면 Tooltip이 렌더링된다.", async () => {
    const { getByLabelText, findByRole } = renderTooltip();
    const button = getByLabelText("툴팁");

    button.focus();

    const tooltip = await findByRole("tooltip");
    expect(tooltip).toBeInTheDocument();
  });

  it("Tooltip이 렌더링된 상태에서 버튼에 대한 포커스가 사라지면 Tooltip이 사라진다.", async () => {
    const { getByLabelText, findByRole } = renderTooltip();
    const button = getByLabelText("툴팁");
    button.focus();
    const tooltip = await findByRole("tooltip");
    expect(tooltip).toBeInTheDocument();

    fireEvent.blur(button);

    expect(tooltip).not.toBeInTheDocument();
  });
});
