import { BrowserRouter, Route, Routes } from "react-router-dom";
import { render } from "../../features/common/utils/test-utils";
import { NotFoundPage } from "../NotFoundPage";

describe("NotFoundPage", () => {
  it("`요청하신 페이지를 찾을 수 없습니다.` 메시지와 메인 페이지로 이동하는 버튼을 렌더링한다.", () => {
    const { getByRole } = render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    );

    const message = getByRole("heading", {
      name: "요청하신 페이지를 찾을 수 없습니다.",
    });

    expect(message).toBeInTheDocument();
  });
});
