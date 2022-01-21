import { render } from "../../features/common/utils/test-utils";
import { NotFoundPage } from "../NotFoundPage";

describe("NotFoundPage", () => {
  it("`404` 상태 코드와 `요청하신 페이지를 찾을 수 없습니다.` 메시지를 렌더링한다.", () => {
    const { getByRole } = render(<NotFoundPage />);

    const statusCode = getByRole("heading", { name: "404" });

    const message = getByRole("heading", {
      name: "요청하신 페이지를 찾을 수 없습니다.",
    });

    expect(statusCode).toBeInTheDocument();
    expect(message).toBeInTheDocument();
  });
});
