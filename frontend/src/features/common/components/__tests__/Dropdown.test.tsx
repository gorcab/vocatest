import userEvent from "@testing-library/user-event";
import { render } from "../../utils/test-utils";
import { DropdownMenu } from "../Dropdown/DropdownMenu";
import { DropdownMenuButton } from "../Dropdown/DropdownMenuButton";
import { DropdownMenuItem } from "../Dropdown/DropdownMenuItem";
import { DropdownMenuList } from "../Dropdown/DropdownMenuList";

describe("Dropdown", () => {
  function renderDropdown() {
    const buttonText = "메뉴 열기";
    const firstItemProps = {
      text: "첫 번째 메뉴 버튼",
      onClick: jest.fn(),
    };
    const secondItemProps = {
      text: "두 번째 메뉴 버튼",
      onClick: jest.fn,
    };
    const thirdItemProps = {
      text: "세 번째 메뉴 버튼",
      onClick: jest.fn,
    };
    const Component = (
      <DropdownMenu>
        <DropdownMenuButton>{buttonText}</DropdownMenuButton>
        <DropdownMenuList>
          <DropdownMenuItem as="button" onClick={firstItemProps.onClick}>
            {firstItemProps.text}
          </DropdownMenuItem>
          <DropdownMenuItem as="button" onClick={secondItemProps.onClick}>
            {secondItemProps.text}
          </DropdownMenuItem>
          <DropdownMenuItem as="button" onClick={thirdItemProps.onClick}>
            {thirdItemProps.text}
          </DropdownMenuItem>
        </DropdownMenuList>
      </DropdownMenu>
    );

    const { getByRole, getAllByRole, queryByRole, findByRole } =
      render(Component);

    return {
      getByRole,
      queryByRole,
      getAllByRole,
      findByRole,
      buttonText,
      firstItemProps,
      secondItemProps,
    };
  }
  it("최초 렌더링 시 메뉴를 열거나 닫을 수 있는 버튼이 렌더링된다.", () => {
    const { getByRole, queryByRole, buttonText } = renderDropdown();

    const menuToggleButton = getByRole("button", { name: buttonText });
    const dropdownMenu = queryByRole("menu");
    expect(menuToggleButton).toBeInTheDocument();
    expect(dropdownMenu).not.toBeInTheDocument();
  });

  it("메뉴가 열리지 않은 상태에서 버튼을 클릭하면 메뉴가 나타나고 해당 메뉴에 포커싱된다.", () => {
    // given
    const { getByRole, buttonText } = renderDropdown();
    const menuToggleButton = getByRole("button", { name: buttonText });

    // when
    userEvent.click(menuToggleButton);

    // then
    const dropdownMenu = getByRole("menu");
    expect(dropdownMenu).toBeInTheDocument();
    expect(document.activeElement).toBe(dropdownMenu);
  });

  it("메뉴가 열린 상태에서 버튼을 클릭하면 메뉴가 사라진다.", () => {
    // given
    const { getByRole, queryByRole, buttonText } = renderDropdown();
    const menuToggleButton = getByRole("button", { name: buttonText });
    userEvent.click(menuToggleButton);
    expect(getByRole("menu")).toBeInTheDocument();

    // when
    userEvent.click(menuToggleButton);

    // then
    expect(queryByRole("menu")).not.toBeInTheDocument();
  });

  it("메뉴가 열린 상태에서 Arrowdown 키를 누르면 첫 번째 메뉴 아이템부터 다음 메뉴 아이템 순으로 반복해서 포커싱된다.", () => {
    // given
    const { getByRole, getAllByRole, buttonText } = renderDropdown();
    const menuToggleButton = getByRole("button", { name: buttonText });
    userEvent.click(menuToggleButton);
    expect(getByRole("menu")).toBeInTheDocument();
    const menuItems = getAllByRole("menuitem");

    // when
    menuItems.forEach((_, index) => {
      userEvent.keyboard("{Arrowdown}");
      expect(document.activeElement).toBe(menuItems[index]);
    });

    // 마지막 메뉴 아이템에서 Arrowdown 키를 누를 경우 첫 번째 메뉴 아이템으로 포커싱
    userEvent.keyboard("{Arrowdown}");
    expect(document.activeElement).toBe(menuItems[0]);
  });

  it("메뉴가 열린 상태에서 Arrowup 키를 누르면 마지막 메뉴 아이템부터 이전 메뉴 아이템 순으로 반복해서 포커싱된다.", () => {
    // given
    const { getByRole, getAllByRole, buttonText } = renderDropdown();
    const menuToggleButton = getByRole("button", { name: buttonText });
    userEvent.click(menuToggleButton);
    expect(getByRole("menu")).toBeInTheDocument();
    const menuItems = getAllByRole("menuitem");

    // when, then
    menuItems.forEach((_, index) => {
      userEvent.keyboard("{Arrowup}");
      expect(document.activeElement).toBe(
        menuItems[menuItems.length - 1 - index]
      );
    });

    // 첫 번째 메뉴 아이템에서 Arrowup 키를 누를 경우 마지막 메뉴 아이템으로 포커싱
    userEvent.keyboard("{Arrowup}");
    expect(document.activeElement).toBe(menuItems[menuItems.length - 1]);
  });

  it("특정 메뉴 아이템을 클릭하면 해당 메뉴 아이템에 click 이벤트가 발생한다.", () => {
    // given
    const { getByRole, getAllByRole, firstItemProps, buttonText } =
      renderDropdown();
    const menuToggleButton = getByRole("button", { name: buttonText });
    userEvent.click(menuToggleButton);
    expect(getByRole("menu")).toBeInTheDocument();
    const menuItems = getAllByRole("menuitem");

    // when
    userEvent.click(menuItems[0]);

    // then
    expect(firstItemProps.onClick).toBeCalled();
  });

  it("특정 메뉴 아이템에 포커싱된 상태에서 Enter 키를 누르면 해당 메뉴 아이템에 click 이벤트가 발생한다.", () => {
    // given
    const { getByRole, firstItemProps, buttonText } = renderDropdown();
    const menuToggleButton = getByRole("button", { name: buttonText });
    userEvent.click(menuToggleButton);
    expect(getByRole("menu")).toBeInTheDocument();
    userEvent.keyboard("{Arrowdown}");

    // when
    userEvent.keyboard("{Enter}");

    // then
    expect(firstItemProps.onClick).toBeCalled();
  });

  it("특정 메뉴 아이템에 포커싱된 상태에서 Space 키를 누르면 해당 메뉴 아이템에 click 이벤트가 발생한다.", () => {
    // given
    const { getByRole, firstItemProps, buttonText } = renderDropdown();
    const menuToggleButton = getByRole("button", { name: buttonText });
    userEvent.click(menuToggleButton);
    expect(getByRole("menu")).toBeInTheDocument();
    userEvent.keyboard("{Arrowdown}");

    // when
    userEvent.keyboard("{space}");

    // then
    expect(firstItemProps.onClick).toBeCalled();
  });

  it("메뉴가 열린 상태에서 Esc 키를 누르면 메뉴가 닫힌다.", () => {
    // given
    const { getByRole, queryByRole, buttonText } = renderDropdown();
    const menuToggleButton = getByRole("button", { name: buttonText });
    userEvent.click(menuToggleButton);
    expect(getByRole("menu")).toBeInTheDocument();

    // when
    userEvent.keyboard("{Escape}");

    // then
    expect(queryByRole("menu")).not.toBeInTheDocument();
  });

  it("특정 메뉴 아이템에 포커싱된 상태에서 Home 키를 누르면 첫 번째 메뉴 아이템으로 포커싱된다.", () => {
    // given
    const { getByRole, getAllByRole, buttonText } = renderDropdown();
    const menuToggleButton = getByRole("button", { name: buttonText });
    userEvent.click(menuToggleButton);
    const menuItems = getAllByRole("menuitem");
    userEvent.hover(menuItems[menuItems.length - 1]);
    expect(document.activeElement).toBe(menuItems[menuItems.length - 1]);

    // when
    userEvent.keyboard("{Home}");

    // then
    expect(document.activeElement).toBe(menuItems[0]);
  });

  it("특정 메뉴 아이템에 포커싱된 상태에서 PageUp 키를 누르면 첫 번째 메뉴 아이템으로 포커싱된다.", () => {
    // given
    const { getByRole, getAllByRole, buttonText } = renderDropdown();
    const menuToggleButton = getByRole("button", { name: buttonText });
    userEvent.click(menuToggleButton);
    const menuItems = getAllByRole("menuitem");
    userEvent.hover(menuItems[menuItems.length - 1]);
    expect(document.activeElement).toBe(menuItems[menuItems.length - 1]);

    // when
    userEvent.keyboard("{Pageup}");

    // then
    expect(document.activeElement).toBe(menuItems[0]);
  });

  it("특정 메뉴 아이템에 포커싱된 상태에서 End 키를 누르면 마지막 메뉴 아이템으로 포커싱된다.", () => {
    // given
    const { getByRole, getAllByRole, buttonText } = renderDropdown();
    const menuToggleButton = getByRole("button", { name: buttonText });
    userEvent.click(menuToggleButton);
    const menuItems = getAllByRole("menuitem");
    userEvent.hover(menuItems[0]);
    expect(document.activeElement).toBe(menuItems[0]);

    // when
    userEvent.keyboard("{End}");

    // then
    expect(document.activeElement).toBe(menuItems[menuItems.length - 1]);
  });

  it("특정 메뉴 아이템에 포커싱된 상태에서 Pagedown 키를 누르면 마지막 메뉴 아이템으로 포커싱된다.", () => {
    // given
    const { getByRole, getAllByRole, buttonText } = renderDropdown();
    const menuToggleButton = getByRole("button", { name: buttonText });
    userEvent.click(menuToggleButton);
    const menuItems = getAllByRole("menuitem");
    userEvent.hover(menuItems[0]);
    expect(document.activeElement).toBe(menuItems[0]);

    // when
    userEvent.keyboard("{Pagedown}");

    // then
    expect(document.activeElement).toBe(menuItems[menuItems.length - 1]);
  });

  it("메뉴가 열린 상태에서 Tab 키를 누르면 포커싱이 그대로 유지된다.", () => {
    // given
    const { getByRole, getAllByRole, buttonText } = renderDropdown();
    const menuToggleButton = getByRole("button", { name: buttonText });
    userEvent.click(menuToggleButton);
    const menu = getByRole("menu");
    const menuItems = getAllByRole("menuitem");
    expect(document.activeElement).toBe(menu);

    // when
    userEvent.keyboard("{Tab}");

    // then
    expect(document.activeElement).toBe(menu);

    // given
    userEvent.hover(menuItems[1]);
    expect(document.activeElement).toBe(menuItems[1]);

    // when
    userEvent.keyboard("{Tab}");

    // then
    expect(document.activeElement).toBe(menuItems[1]);
  });

  it("특정 메뉴 아이템으로부터 마우스를 unhover하면 메뉴로 포커싱된다.", () => {
    // given
    const { getByRole, getAllByRole, buttonText } = renderDropdown();
    const menuToggleButton = getByRole("button", { name: buttonText });
    userEvent.click(menuToggleButton);
    const menu = getByRole("menu");
    const menuItems = getAllByRole("menuitem");
    userEvent.hover(menuItems[1]);
    expect(document.activeElement).toBe(menuItems[1]);

    // when
    userEvent.unhover(menuItems[1]);

    // then
    expect(document.activeElement).toBe(menu);
  });
});
