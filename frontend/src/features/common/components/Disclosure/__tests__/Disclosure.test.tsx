import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Disclosure } from "../Disclosure";
import { DisclosureButton } from "../DisclosureButton";
import { DisclosurePanel } from "../DisclosurePanel";

describe("Disclosure", () => {
  function renderDisclosure() {
    const buttonText = "버튼";
    const panelText = "패널";
    const Component = (
      <Disclosure>
        <DisclosureButton>{buttonText}</DisclosureButton>
        <DisclosurePanel>{panelText}</DisclosurePanel>
      </Disclosure>
    );

    const { getByRole, findByText } = render(Component);

    return {
      buttonText,
      panelText,
      getByRole,
      findByText,
    };
  }
  it('최초 렌더링 시, <DisclosureButton /> 컴포넌트는 aria-expanded="false" 상태이다.', () => {
    const { getByRole } = renderDisclosure();

    const button = getByRole("button", { expanded: false });

    expect(button).toBeInTheDocument();
  });

  it("버튼을 클릭하면 <DisclosurePanel /> 컴포넌트가 렌더링되고, 해당 패널의 id를 버튼의 aria-controls 속성으로 갖는다.", async () => {
    const { getByRole, findByText, panelText } = renderDisclosure();

    const button = getByRole("button", { expanded: false });

    userEvent.click(button);

    const panel = await findByText(panelText);

    expect(panel).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAttribute("aria-controls", panel.id);
  });

  it('패널이 열린 상태에서 버튼을 다시 클릭하면 패널이 없어지고 버튼의 aria-expanded="false", aria-controls 속성은 없어진다.', async () => {
    const { getByRole, findByText, panelText } = renderDisclosure();

    const button = getByRole("button", { expanded: false });

    userEvent.click(button);

    const panel = await findByText(panelText);

    userEvent.click(button);

    expect(panel).not.toBeInTheDocument();
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).not.toHaveAttribute("aria-controls");
  });
});
