import userEvent from "@testing-library/user-event";
import { render, waitFor, within } from "features/common/utils/test-utils";
import { useToast } from "features/toast/hooks/useToast";
import React from "react";
import { ToastContainer } from "../ToastContainer";

describe("ToastContainer", () => {
  function renderToastContainer() {
    const Component: React.FC = () => {
      const toast = useToast();
      const createToast = () =>
        toast({
          type: "ERROR",
          desc: "토스트 생성",
        });
      return (
        <>
          <ToastContainer />
          <button type="button" onClick={createToast}>
            토스트 생성하기
          </button>
        </>
      );
    };

    const { getByRole, findByRole, debug } = render(<Component />);

    return {
      getByRole,
      findByRole,
      debug,
    };
  }
  it("Toast 생성 버튼을 클릭하면 Toast를 띄운다.", async () => {
    const { getByRole, findByRole } = renderToastContainer();
    const createToastButton = getByRole("button", { name: "토스트 생성하기" });

    userEvent.click(createToastButton);

    const toastList = await findByRole("list");
    const toast = await within(toastList).findByRole("alert");

    expect(toast).toHaveTextContent("토스트 생성");
  });

  it("Toast의 `닫기` 아이콘 버튼을 클릭하면 해당 Toast가 닫힌다.", async () => {
    const { getByRole, findByRole } = renderToastContainer();
    const createToastButton = getByRole("button", { name: "토스트 생성하기" });

    userEvent.click(createToastButton);

    const toastList = await findByRole("list");
    const toast = await within(toastList).findByRole("alert");
    expect(toast).toBeInTheDocument();

    const closeButton = getByRole("button", { name: "닫기" });
    userEvent.click(closeButton);

    await waitFor(() => {
      expect(within(toastList).queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
