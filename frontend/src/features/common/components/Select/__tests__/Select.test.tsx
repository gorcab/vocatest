import userEvent from "@testing-library/user-event";
import { fireEvent, render, waitFor } from "features/common/utils/test-utils";
import { Select } from "../Select";
import { SelectButton } from "../SelectButton";
import { SelectLabel } from "../SelectLabel";
import { SelectListBox } from "../SelectListBox";
import { SelectOption } from "../SelectOption";

describe("Select", () => {
  const options = [
    { value: 1, label: "옵션 1" },
    { value: 2, label: "옵션 2" },
    { value: 3, label: "옵션 3" },
  ];

  function renderSelect(selectIndex: number = 0) {
    let selectedOption = options[selectIndex];
    const onBlur = jest.fn();
    const onChange = jest.fn();
    const Component = (
      <Select onChange={onChange} value={selectedOption.value}>
        <SelectLabel>옵션</SelectLabel>
        <SelectButton onBlur={onBlur}>{selectedOption.label}</SelectButton>
        <SelectListBox>
          {options.map((option) => (
            <SelectOption key={option.value} value={option.value}>
              {option.label}
            </SelectOption>
          ))}
        </SelectListBox>
      </Select>
    );

    const { getByRole, getAllByRole, getByText, queryByRole, getByLabelText } =
      render(Component);

    return {
      onBlur,
      onChange,
      selectedOption,
      getByRole,
      getByText,
      getByLabelText,
      queryByRole,
      getAllByRole,
    };
  }
  it("최초 렌더링 시, listbox를 열고 닫을 수 있는 버튼만 렌더링된다.", () => {
    const { getByRole, queryByRole } = renderSelect();
    const selectButton = getByRole("button", { expanded: false });
    const listBox = queryByRole("listbox");

    expect(selectButton).toBeInTheDocument();
    expect(listBox).not.toBeInTheDocument();
  });

  describe("listbox가 열리지 않은 상태", () => {
    it("label을 클릭하면 버튼에 포커싱된다.", () => {
      const { getByText, getByRole } = renderSelect();
      const label = getByText("옵션");
      const selectButton = getByRole("button", { expanded: false });

      userEvent.click(label);

      expect(document.activeElement).toBe(selectButton);
    });

    it("버튼을 클릭하면 listbox가 렌더링되고 현재 선택된 옵션에 포커싱된다.", () => {
      const { getByRole, getAllByRole, selectedOption } = renderSelect();
      const selectButton = getByRole("button", { expanded: false });

      userEvent.click(selectButton);

      const listBox = getByRole("listbox");
      const optionElements = getAllByRole("option");
      const selectedOptionElement = getByRole("option", {
        name: selectedOption.label,
      });

      expect(listBox).toBeInTheDocument();
      expect(optionElements).toHaveLength(options.length);
      expect(document.activeElement).toBe(selectedOptionElement);
    });

    it("버튼이 포커싱된 상태에서 Enter 키를 누르면 현재 선택된 옵션에 포커싱된다.", () => {
      const { getByRole, selectedOption } = renderSelect();
      const selectButton = getByRole("button", { expanded: false });
      selectButton.focus();

      userEvent.keyboard("{Enter}");

      const selectedOptionElement = getByRole("option", {
        name: selectedOption.label,
      });

      expect(document.activeElement).toBe(selectedOptionElement);
    });

    it("버튼이 포커싱된 상태에서 Space 키를 누르면 현재 선택된 옵션에 포커싱된다.", () => {
      const { getByRole, selectedOption } = renderSelect();
      const selectButton = getByRole("button", { expanded: false });
      selectButton.focus();

      userEvent.keyboard("{space}");

      const selectedOptionElement = getByRole("option", {
        name: selectedOption.label,
      });

      expect(document.activeElement).toBe(selectedOptionElement);
    });

    it("버튼이 포커싱된 상태에서 ArrowDown 키를 누르면 현재 선택된 옵션에 포커싱된다.", () => {
      const { getByRole, selectedOption } = renderSelect(1);
      const selectButton = getByRole("button", { expanded: false });
      selectButton.focus();

      userEvent.keyboard("{ArrowDown}");

      const selectOptionElement = getByRole("option", {
        name: selectedOption.label,
      });
      expect(document.activeElement).toBe(selectOptionElement);
    });

    it("버튼이 포커싱된 상태에서 ArrowUp 키를 누르면 현재 선택된 옵션에 포커싱된다.", () => {
      const { getByRole, selectedOption } = renderSelect(2);
      const selectButton = getByRole("button", { expanded: false });
      selectButton.focus();

      userEvent.keyboard("{ArrowUp}");

      const selectOptionElement = getByRole("option", {
        name: selectedOption.label,
      });
      expect(document.activeElement).toBe(selectOptionElement);
    });

    it("버튼이 포커싱된 상태에서 버튼에 blur 이벤트가 발생하면 onBlur 콜백 함수가 호출된다.", async () => {
      const { getByRole, onBlur, selectedOption } = renderSelect();
      const selectButton = getByRole("button", { expanded: false });
      selectButton.focus();
      expect(onBlur).not.toBeCalled();

      fireEvent.blur(selectButton);

      expect(onBlur).toBeCalledWith(selectedOption.value);
    });
  });

  describe("listbox가 열린 상태", () => {
    it("옵션이 포커싱된 상태에서 ArrowDown 키를 누르면 다음 옵션으로 포커싱되며, 마지막 옵션에서 ArrowDown 키를 누르면 마지막 옵션에 계속 포커싱이 유지된다.", () => {
      const initialFocusIndex = 0;
      const { getByRole, getAllByRole } = renderSelect(initialFocusIndex);
      const selectButton = getByRole("button", { expanded: false });
      userEvent.click(selectButton);

      const optionElements = getAllByRole("option");

      optionElements.forEach((optionElement, index) => {
        expect(document.activeElement).toBe(optionElements[index]);
        userEvent.keyboard("{ArrowDown}");
      });
      expect(document.activeElement).toBe(
        optionElements[optionElements.length - 1]
      );
    });

    it("옵션이 포커싱된 상태에서 ArrowUp 키를 누르면 이전 옵션으로 포커싱되며, 첫 번째 옵션에서 ArrowUp 키를 누르면 첫 번째 옵션에 계속 포커싱이 유지된다.", () => {
      const initialFocusIndex = options.length - 1;
      const { getByRole, getAllByRole } = renderSelect(initialFocusIndex);
      const selectButton = getByRole("button", { expanded: false });
      userEvent.click(selectButton);

      const optionElements = getAllByRole("option");

      optionElements.forEach((optionElement, index) => {
        expect(document.activeElement).toBe(
          optionElements[options.length - 1 - index]
        );
        userEvent.keyboard("{ArrowUp}");
      });
      expect(document.activeElement).toBe(optionElements[0]);
    });

    it("특정 옵션으로 마우스를 hover하면 해당 옵션이 포커싱된다.", async () => {
      const { getByRole, getAllByRole } = renderSelect();
      const selectButton = getByRole("button", { expanded: false });
      userEvent.click(selectButton);
      const optionElements = getAllByRole("option");
      expect(document.activeElement).toBe(optionElements[0]);

      await userEvent.hover(optionElements[2]);

      expect(document.activeElement).toBe(optionElements[2]);
    });

    it("특정 옵션에 포커싱된 상태에서 마우스를 unhover하면 listbox로 포커싱된다.", async () => {
      const { getByRole, getAllByRole } = renderSelect();
      const selectButton = getByRole("button", { expanded: false });
      userEvent.click(selectButton);
      const listBox = getByRole("listbox");
      const optionElements = getAllByRole("option");
      expect(document.activeElement).toBe(optionElements[0]);

      await userEvent.hover(optionElements[1]);
      expect(document.activeElement).toBe(optionElements[1]);

      await userEvent.unhover(optionElements[1]);
      expect(document.activeElement).toBe(listBox);
    });

    it("listbox에 포커싱된 상태에서 ArrowDown 키를 누르면 첫 번째 옵션으로 포커싱된다.", async () => {
      const { getByRole, getAllByRole } = renderSelect();
      const selectButton = getByRole("button", { expanded: false });
      userEvent.click(selectButton);
      const listBox = getByRole("listbox");
      const optionElements = getAllByRole("option");
      await userEvent.hover(optionElements[0]);
      await userEvent.unhover(optionElements[0]);
      expect(document.activeElement).toBe(listBox);

      userEvent.keyboard("{ArrowDown}");

      expect(document.activeElement).toBe(optionElements[0]);
    });

    it("listbox에 포커싱된 상태에서 ArrowUp 키를 누르면 마지막 옵션으로 포커싱된다.", async () => {
      const { getByRole, getAllByRole } = renderSelect();
      const selectButton = getByRole("button", { expanded: false });
      userEvent.click(selectButton);
      const listBox = getByRole("listbox");
      const optionElements = getAllByRole("option");
      await userEvent.hover(optionElements[0]);
      await userEvent.unhover(optionElements[0]);
      expect(document.activeElement).toBe(listBox);

      userEvent.keyboard("{ArrowUp}");

      expect(document.activeElement).toBe(optionElements[options.length - 1]);
    });

    it("특정 옵션이 포커싱된 상태에서 Enter 키를 누르면 해당 옵션이 선택되고 onChange 콜백 함수가 호출된다.", async () => {
      const { getByRole, getAllByRole, onChange } = renderSelect();
      const selectButton = getByRole("button", { expanded: false });
      userEvent.click(selectButton);
      const optionElements = getAllByRole("option");
      await userEvent.hover(optionElements[1]);
      expect(document.activeElement).toBe(optionElements[1]);

      userEvent.keyboard("{Enter}");

      await waitFor(() => {
        expect(onChange).toBeCalledWith(options[1].value);
      });
    });

    it("특정 옵션이 포커싱된 상태에서 Space 키를 누르면 해당 옵션이 선택되고 onChange 콜백 함수가 호출된다.", async () => {
      const { getByRole, getAllByRole, onChange } = renderSelect();
      const selectButton = getByRole("button", { expanded: false });
      userEvent.click(selectButton);
      const optionElements = getAllByRole("option");
      await userEvent.hover(optionElements[1]);
      expect(document.activeElement).toBe(optionElements[1]);

      userEvent.keyboard("{space}");

      await waitFor(() => {
        expect(onChange).toBeCalledWith(options[1].value);
      });
    });

    it("listbox에 포커싱된 상태에서 Enter 키를 누르면 현재 선택된 옵션이 그대로 유지되고 listbox가 닫힌다.", async () => {
      const { getByRole, getAllByRole, queryByRole, onChange } = renderSelect();
      const selectButton = getByRole("button", { expanded: false });
      userEvent.click(selectButton);
      const listBox = getByRole("listbox");
      const optionElements = getAllByRole("option");
      await userEvent.hover(optionElements[1]);
      await userEvent.unhover(optionElements[1]);
      expect(document.activeElement).toBe(listBox);

      userEvent.keyboard("{Enter}");

      expect(queryByRole("listbox")).not.toBeInTheDocument();
      expect(onChange).not.toBeCalled();
    });

    it("listbox에 포커싱된 상태에서 space 키를 누르면 현재 선택된 옵션이 그대로 유지되고 listbox가 닫힌다.", async () => {
      const { getByRole, getAllByRole, queryByRole, onChange } = renderSelect();
      const selectButton = getByRole("button", { expanded: false });
      userEvent.click(selectButton);
      const listBox = getByRole("listbox");
      const optionElements = getAllByRole("option");
      await userEvent.hover(optionElements[1]);
      await userEvent.unhover(optionElements[1]);
      expect(document.activeElement).toBe(listBox);

      userEvent.keyboard("{space}");

      expect(queryByRole("listbox")).not.toBeInTheDocument();
      expect(onChange).not.toBeCalled();
    });

    it("Escape 키를 누르면 listbox가 닫힌다.", () => {
      const { getByRole, queryByRole } = renderSelect();
      const selectButton = getByRole("button", { expanded: false });
      userEvent.click(selectButton);
      expect(getByRole("listbox")).toBeInTheDocument();

      userEvent.keyboard("{Escape}");

      expect(queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("Tab 키를 누르면 포커싱이 기존의 요소에 그대로 유지된다.", async () => {
      const { getByRole, getAllByRole } = renderSelect();
      const selectButton = getByRole("button", { expanded: false });
      userEvent.click(selectButton);
      const listBox = getByRole("listbox");
      const optionElements = getAllByRole("option");
      expect(document.activeElement).toBe(optionElements[0]);

      userEvent.keyboard("{Tab}");
      expect(document.activeElement).toBe(optionElements[0]);

      await userEvent.hover(optionElements[1]);
      userEvent.keyboard("{Tab}");
      expect(document.activeElement).toBe(optionElements[1]);

      await userEvent.unhover(optionElements[1]);
      expect(document.activeElement).toBe(listBox);

      userEvent.keyboard("{Tab}");
      expect(document.activeElement).toBe(listBox);
    });
  });
});
