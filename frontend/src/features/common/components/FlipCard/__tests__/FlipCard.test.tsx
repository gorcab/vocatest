import userEvent from "@testing-library/user-event";
import { render, waitFor } from "features/common/utils/test-utils";
import { useFlipCard } from "../context/FlipCardContext";
import { FlipCardBack } from "../FlipCardBack";
import { FlipCardFront } from "../FlipCardFront";
import { FlipProvider } from "../FlipProvider";

describe("FlipCard", () => {
  function renderFlipCard() {
    const frontText = "앞면";
    const backText = "뒷면";

    const FlipButton = () => {
      const { flipCard } = useFlipCard(FlipButton.name);

      return <button onClick={() => flipCard()}>버튼</button>;
    };

    const Component = (
      <FlipProvider>
        <FlipCardFront>{frontText}</FlipCardFront>
        <FlipCardBack>{backText}</FlipCardBack>
        <FlipButton />
      </FlipProvider>
    );

    const { getByRole, getByText } = render(Component);

    return {
      getByRole,
      getByText,
      frontText,
      backText,
    };
  }

  it("최초 렌더링 시, <FlipCardFront /> 컴포넌트가 보이고 <FlipCardBack /> 컴포넌트는 hidden 상태이다.", () => {
    const { getByText, frontText, backText } = renderFlipCard();

    const front = getByText(frontText);
    const back = getByText(backText);

    expect(front).toHaveStyle({
      visibility: "visible",
    });
    expect(back).toHaveStyle({
      visibility: "hidden",
    });
  });

  it("버튼을 클릭하면 앞면과 뒷면이 뒤집히고 visibility 상태도 그에 따라 변한다.", async () => {
    const { getByRole, getByText, frontText, backText } = renderFlipCard();

    const front = getByText(frontText);
    const back = getByText(backText);
    const flipButton = getByRole("button");

    expect(front).toHaveStyle({
      visibility: "visible",
    });
    expect(back).toHaveStyle({
      visibility: "hidden",
    });

    userEvent.click(flipButton);

    await waitFor(() => {
      expect(front).toHaveStyle({
        visibility: "hidden",
      });
      expect(back).toHaveStyle({
        visibility: "visible",
      });
    });

    userEvent.click(flipButton);

    await waitFor(() => {
      expect(front).toHaveStyle({
        visibility: "visible",
      });
      expect(back).toHaveStyle({
        visibility: "hidden",
      });
    });
  });
});
