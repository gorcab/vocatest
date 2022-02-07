import userEvent from "@testing-library/user-event";
import { fireEvent, render, waitFor } from "../../utils/test-utils";
import { Select } from "../Select/Select";

describe("Select", () => {
  function renderSelect(initialValue: number | undefined = undefined) {
    const onBlur = jest.fn();
    const onChange = jest.fn();
    const selectLabel = "옵션 선택";
    const options = [
      { value: 1, label: "옵션 1" },
      { value: 2, label: "옵션 2" },
      { value: 3, label: "옵션 3" },
    ];
    const Component = (
      <Select
        onBlur={onBlur}
        onChange={onChange}
        selectLabel={selectLabel}
        options={options}
        initialValue={initialValue}
      />
    );

    const { getByRole, getAllByRole } = render(Component);

    return {
      onBlur,
      onChange,
      selectLabel,
      options,
      getByRole,
      getAllByRole,
    };
  }

  it("최초 렌더링 시, 버튼은 보이고 listbox는 `invisible` className을 갖는다.", () => {
    const { getByRole, selectLabel } = renderSelect();

    const selectButton = getByRole("button", { name: selectLabel });
    const listBox = getByRole("listbox");

    expect(selectButton).toBeInTheDocument();
    expect(listBox).toHaveClass("invisible");
  });

  describe("listbox가 열리지 않은 상태", () => {
    it("옵션이 선택되지 않은 상태에서 버튼을 클릭하면 listbox는 `visible` className을 가지며, 첫 번째 옵션으로 포커싱된다.", () => {
      const { getByRole, getAllByRole, selectLabel } = renderSelect();

      const selectButton = getByRole("button", { name: selectLabel });
      const listBox = getByRole("listbox");
      const options = getAllByRole("option");
      userEvent.click(selectButton);

      expect(listBox).toHaveClass("visible");
      expect(document.activeElement).toBe(options[0]);
    });

    it("옵션이 선택된 상태에서 버튼을 클릭하면 listbox는 `visible` className을 가지며, 선택된 옵션으로 포커싱된다.", () => {
      const value = 3;
      const { getByRole, getAllByRole, options, selectLabel } =
        renderSelect(value);
      const optionIndex = options.findIndex((option) => option.value === value);

      const selectButton = getByRole("button", { name: selectLabel });
      const listBox = getByRole("listbox");
      const optionElements = getAllByRole("option");
      userEvent.click(selectButton);

      expect(listBox).toHaveClass("visible");
      expect(document.activeElement).toBe(optionElements[optionIndex]);
    });

    it("아무 옵션이 선택되지 않았고, 버튼이 포커싱된 상태에서 Enter 키를 누르면 첫 번째 옵션으로 포커싱된다.", () => {
      const { getByRole, getAllByRole, selectLabel } = renderSelect();

      const selectButton = getByRole("button", { name: selectLabel });
      const options = getAllByRole("option");

      selectButton.focus();
      userEvent.keyboard("{Enter}");

      expect(document.activeElement).toBe(options[0]);
    });

    it("옵션이 선택되었고, 버튼이 포커싱된 상태에서 Enter 키를 누르면 선택된 옵션으로 포커싱된다.", () => {
      const value = 1;
      const { getByRole, getAllByRole, options, selectLabel } =
        renderSelect(value);
      const optionIndex = options.findIndex((option) => option.value === value);

      const selectButton = getByRole("button", { name: selectLabel });
      const optionElements = getAllByRole("option");

      selectButton.focus();
      userEvent.keyboard("{Enter}");

      expect(document.activeElement).toBe(optionElements[optionIndex]);
    });

    it("아무 옵션이 선택되지 않았고, 버튼이 포커싱된 상태에서 Space 키를 누르면 첫 번째 옵션으로 포커싱된다.", () => {
      const { getByRole, getAllByRole, selectLabel } = renderSelect();

      const selectButton = getByRole("button", { name: selectLabel });
      const options = getAllByRole("option");

      selectButton.focus();
      userEvent.keyboard("{space}");

      expect(document.activeElement).toBe(options[0]);
    });

    it("옵션이 선택되었고, 버튼이 포커싱된 상태에서 Space 키를 누르면 선택된 옵션으로 포커싱된다.", () => {
      const value = 1;
      const { getByRole, getAllByRole, options, selectLabel } =
        renderSelect(value);
      const optionIndex = options.findIndex((option) => option.value === value);

      const selectButton = getByRole("button", { name: selectLabel });
      const optionElements = getAllByRole("option");

      selectButton.focus();
      userEvent.keyboard("{space}");

      expect(document.activeElement).toBe(optionElements[optionIndex]);
    });

    it("아무 옵션이 선택되지 않았고, 버튼에 포커싱된 상태에서 ArrowDown 키를 누르면 첫 번째 옵션으로 포커싱된다.", () => {
      const { getByRole, getAllByRole, selectLabel } = renderSelect();

      const selectButton = getByRole("button", { name: selectLabel });
      const options = getAllByRole("option");

      selectButton.focus();
      userEvent.keyboard("{ArrowDown}");

      expect(document.activeElement).toBe(options[0]);
    });

    it("옵션이 선택되었으며, 버튼에 포커싱된 상태에서 ArrowDown 키를 누르면 선택된 옵션으로 포커싱된다.", () => {
      const value = 2;
      const { getByRole, options, getAllByRole, selectLabel } =
        renderSelect(value);

      const optionIndex = options.findIndex((option) => option.value === value);

      const selectButton = getByRole("button", { name: selectLabel });
      const optionElements = getAllByRole("option");

      selectButton.focus();
      userEvent.keyboard("{ArrowDown}");

      expect(document.activeElement).toBe(optionElements[optionIndex]);
    });

    it("아무 옵션도 선택되지 않았고, 버튼에 포커싱된 상태에서 ArrowUp 키를 누르면 첫 번째 옵션으로 포커싱된다.", () => {
      const { getByRole, getAllByRole, selectLabel } = renderSelect();

      const selectButton = getByRole("button", { name: selectLabel });
      const options = getAllByRole("option");

      selectButton.focus();
      userEvent.keyboard("{ArrowUp}");

      expect(document.activeElement).toBe(options[0]);
    });

    it("옵션이 선택되었고, 버튼에 포커싱된 상태에서 ArrowUp 키를 누르면 선택된 옵션으로 포커싱된다.", () => {
      const value = 2;
      const { getByRole, options, getAllByRole, selectLabel } =
        renderSelect(value);

      const optionIndex = options.findIndex((option) => option.value === value);

      const selectButton = getByRole("button", { name: selectLabel });
      const optionElements = getAllByRole("option");

      selectButton.focus();
      userEvent.keyboard("{ArrowUp}");

      expect(document.activeElement).toBe(optionElements[optionIndex]);
    });

    it("옵션이 선택되었고, 버튼이 포커싱된 상태에서 다른 요소로 포커싱이 없어지면 onBlur 콜백 함수를 호출한다.", async () => {
      const { getByRole, onBlur, selectLabel, options } = renderSelect();
      const selectButton = getByRole("button", { name: selectLabel });
      userEvent.click(selectButton);
      userEvent.keyboard("{Enter}");

      fireEvent.blur(selectButton);

      expect(onBlur).toBeCalledWith(options[0].value);
    });
  });

  describe("listbox가 열린 상태", () => {
    it("옵션이 포커싱된 상태에서 ArrowDown 키를 누르면 다음 옵션으로 포커싱되며, 마지막 옵션에서 ArrowDown 키를 누르면 포커싱을 마지막 옵션에 유지한다.", () => {
      const { getByRole, getAllByRole, selectLabel } = renderSelect();

      const selectButton = getByRole("button", { name: selectLabel });
      userEvent.click(selectButton);

      const options = getAllByRole("option");

      options.forEach((option) => {
        expect(document.activeElement).toBe(option);
        userEvent.keyboard("{ArrowDown}");
      });

      expect(document.activeElement).toBe(options[options.length - 1]);
    });

    it("옵션이 포커싱된 상태에서 ArrowUp 키를 누르면 이전 옵션으로 포커싱되며, 첫 번째 옵션에서 ArrowUp 키를 누르면 포커싱을 첫 번째 옵션에 유지한다.", () => {
      const { getByRole, getAllByRole, selectLabel } = renderSelect(3);

      const selectButton = getByRole("button", { name: selectLabel });
      userEvent.click(selectButton);

      const options = getAllByRole("option");

      options.forEach((_, index) => {
        expect(document.activeElement).toBe(
          options[options.length - 1 - index]
        );
        userEvent.keyboard("{ArrowUp}");
      });

      expect(document.activeElement).toBe(options[0]);
    });

    it("특정 옵션으로 마우스를 hover하면 해당 옵션이 포커싱된다.", async () => {
      const { getByRole, getAllByRole, selectLabel } = renderSelect();
      const selectButton = getByRole("button", { name: selectLabel });
      userEvent.click(selectButton);
      const options = getAllByRole("option");
      expect(document.activeElement).toBe(options[0]);

      await userEvent.hover(options[2]);

      expect(document.activeElement).toBe(options[2]);
    });

    it("특정 옵션이 포커싱된 상태에서 마우스를 unhover하면 listbox로 포커싱된다.", async () => {
      const { getByRole, getAllByRole, selectLabel } = renderSelect();
      const selectButton = getByRole("button", { name: selectLabel });
      const listBox = getByRole("listbox");
      userEvent.click(selectButton);
      const options = getAllByRole("option");

      await userEvent.hover(options[0]);
      expect(document.activeElement).toBe(options[0]);

      await userEvent.unhover(options[0]);
      expect(document.activeElement).toBe(listBox);
    });

    it("listbox에 포커싱된 상태에서 ArrowDown 키를 누르면 첫 번째 옵션으로 포커싱된다.", async () => {
      const { getByRole, getAllByRole, selectLabel } = renderSelect();
      const selectButton = getByRole("button", { name: selectLabel });
      userEvent.click(selectButton);
      const options = getAllByRole("option");
      await userEvent.hover(options[0]);
      await userEvent.unhover(options[0]);

      userEvent.keyboard("{ArrowDown}");

      expect(document.activeElement).toBe(options[0]);
    });

    it("listbox에 포커싱된 상태에서 ArrowUp 키를 누르면 마지막 옵션으로 포커싱된다.", async () => {
      const { getByRole, getAllByRole, selectLabel } = renderSelect();
      const selectButton = getByRole("button", { name: selectLabel });
      userEvent.click(selectButton);
      const options = getAllByRole("option");
      await userEvent.hover(options[0]);
      await userEvent.unhover(options[0]);

      userEvent.keyboard("{ArrowUp}");

      expect(document.activeElement).toBe(options[options.length - 1]);
    });

    it("옵션이 포커싱된 상태에서 Enter 키를 누르면 해당 옵션이 선택된다.", () => {
      const { getByRole, getAllByRole, options, selectLabel, onChange } =
        renderSelect();
      const selectButton = getByRole("button", { name: selectLabel });
      userEvent.click(selectButton);
      const optionElements = getAllByRole("option");

      expect(document.activeElement).toBe(optionElements[0]);

      userEvent.keyboard("{Enter}");

      expect(selectButton).toHaveTextContent(options[0].label);
      expect(onChange).toBeCalledWith(options[0].value);
    });

    it("옵션이 포커싱된 상태에서 space 키를 누르면 해당 옵션이 선택된다.", () => {
      const { getByRole, getAllByRole, options, selectLabel, onChange } =
        renderSelect();
      const selectButton = getByRole("button", { name: selectLabel });
      userEvent.click(selectButton);
      const optionElements = getAllByRole("option");

      expect(document.activeElement).toBe(optionElements[0]);

      userEvent.keyboard("{space}");

      expect(selectButton).toHaveTextContent(options[0].label);
      expect(onChange).toBeCalledWith(options[0].value);
    });

    it("listbox에 포커싱된 상태에서 Enter 키를 누르면 아무 옵션도 선택되지 않고 기존의 옵션을 유지한다.", async () => {
      const { getByRole, getAllByRole, onChange, selectLabel } = renderSelect();
      const selectButton = getByRole("button", { name: selectLabel });
      const listBox = getByRole("listbox");
      const options = getAllByRole("option");
      userEvent.click(selectButton);

      await userEvent.hover(options[0]);
      await userEvent.unhover(options[0]);

      expect(document.activeElement).toBe(listBox);

      userEvent.keyboard("{Enter}");

      await waitFor(() => {
        expect(document.activeElement).toBe(selectButton);
      });
      expect(onChange).not.toBeCalled();
    });

    it("listbox에 포커싱된 상태에서 space 키를 누르면 아무 옵션도 선택되지 않고 기존의 옵션을 유지한다.", async () => {
      const { getByRole, getAllByRole, onChange, selectLabel } = renderSelect();
      const selectButton = getByRole("button", { name: selectLabel });
      const listBox = getByRole("listbox");
      const options = getAllByRole("option");
      userEvent.click(selectButton);

      await userEvent.hover(options[0]);
      await userEvent.unhover(options[0]);

      expect(document.activeElement).toBe(listBox);

      userEvent.keyboard("{space}");

      await waitFor(() => {
        expect(document.activeElement).toBe(selectButton);
      });
      expect(onChange).not.toBeCalled();
    });

    it("listbox가 열린 상태에서 Escape 키를 누르면 listbox가 닫힌다.", () => {
      const { getByRole, selectLabel } = renderSelect();
      const selectButton = getByRole("button", { name: selectLabel });
      userEvent.click(selectButton);
      const listBox = getByRole("listbox");

      expect(listBox).toHaveClass("visible");

      userEvent.keyboard("{Escape}");

      expect(listBox).toHaveClass("invisible");
    });

    it("listbox가 열린 상태에서 Tab 키를 누르면 포커싱이 기존의 요소에 그대로 유지된다.", async () => {
      const { getByRole, getAllByRole, selectLabel } = renderSelect();
      const selectButton = getByRole("button", { name: selectLabel });
      const listBox = getByRole("listbox");
      const options = getAllByRole("option");
      userEvent.click(selectButton);

      expect(document.activeElement).toBe(options[0]);

      userEvent.keyboard("{Tab}");

      expect(document.activeElement).toBe(options[0]);

      await userEvent.hover(options[0]);
      await userEvent.unhover(options[0]);

      expect(document.activeElement).toBe(listBox);

      userEvent.keyboard("{Tab}");

      expect(document.activeElement).toBe(listBox);
    });
  });
});
