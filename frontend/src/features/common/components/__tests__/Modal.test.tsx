import userEvent from "@testing-library/user-event";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { render } from "../../utils/test-utils";
import { Modal } from "../Modal";

describe("Modal", () => {
  function renderModal() {
    window.history.replaceState({}, "", "/");
    const portal = document.createElement("div");
    portal.classList.add("portal");
    const closeHandler = jest.fn();

    const Component = (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Modal onClose={closeHandler} isOpen={true}>
                <p>모달 테스트</p>
                <input type="text" placeholder="입력 필드" />
                <input type="text" placeholder="입력 2 필드" />
                <button type="button">버튼</button>
              </Modal>
            }
          />
        </Routes>
      </BrowserRouter>
    );

    const { getByRole, getByPlaceholderText, getByText } = render(Component, {
      container: document.body.appendChild(portal),
    });

    return {
      getByRole,
      getByText,
      getByPlaceholderText,
      closeHandler,
    };
  }

  afterEach(() => {
    jest.clearAllMocks();
  });
  it("Modal과 내부 요소들이 렌더링된다.", () => {
    const { getByRole, getByText, getByPlaceholderText } = renderModal();

    const modal = getByRole("dialog");
    const paragraph = getByText("모달 테스트");
    const inputField = getByPlaceholderText("입력 필드");
    const input2Field = getByPlaceholderText("입력 2 필드");
    const button = getByRole("button", { name: "버튼" });

    expect(modal).toBeInTheDocument();
    expect(paragraph).toBeInTheDocument();
    expect(inputField).toBeInTheDocument();
    expect(input2Field).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it("`Tab` 키를 누를 때마다 Modal 내부의 focusable 요소들이 차례대로 포커싱된다.", () => {
    const { getByRole, getByPlaceholderText } = renderModal();

    const inputField = getByPlaceholderText("입력 필드");
    const input2Field = getByPlaceholderText("입력 2 필드");
    const button = getByRole("button", { name: "버튼" });

    userEvent.tab();
    expect(document.activeElement).toBe(inputField);

    userEvent.tab();
    expect(document.activeElement).toBe(input2Field);

    userEvent.tab();
    expect(document.activeElement).toBe(button);

    userEvent.tab();
    expect(document.activeElement).toBe(inputField);

    userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(button);
  });

  it("Modal이 열린 상태에서 overlay element를 클릭하면 onClose 콜백 함수가 호출된다.", () => {
    const { getByRole, closeHandler } = renderModal();

    const overlayElement = getByRole("dialog");

    userEvent.click(overlayElement);

    expect(closeHandler).toBeCalled();
  });
});
