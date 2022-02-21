import userEvent from "@testing-library/user-event";
import { render } from "features/common/utils/test-utils";
import { createMockVocabularyList } from "mocks/lib/vocabulary.factory";
import { VocabularyProblemListTemplate } from "../VocabularyProblemListTemplate";

describe("VocabularyProblemListTemplate", () => {
  function renderVocabularyListTemplate() {
    const vocabularyList = createMockVocabularyList();

    const { getByRole, getAllByRole, getByText } = render(
      <VocabularyProblemListTemplate vocabularyList={vocabularyList} />
    );

    return {
      vocabularyList,
      getByRole,
      getAllByRole,
      getByText,
    };
  }

  it("최초 렌더링 시, 해당 단어장의 title과 학습할 남은 단어 수, 단어 카드가 렌더링된다.", () => {
    const { getByRole, vocabularyList } = renderVocabularyListTemplate();
    const numOfVocabularies = vocabularyList.vocabularies.length;
    const headerTitle = getByRole("heading", { name: vocabularyList.title });
    const remainingWordsLen = getByRole("status");
    const wordCard = getByRole("button", { expanded: false });
    const skipButton = getByRole("button", { name: "O" });
    const reviewButton = getByRole("button", { name: "X" });

    expect(headerTitle).toBeInTheDocument();
    expect(remainingWordsLen).toHaveTextContent(
      `남은 단어 수: ${numOfVocabularies} / ${numOfVocabularies}`
    );
    expect(wordCard).toBeInTheDocument();
    expect(skipButton).toBeInTheDocument();
    expect(reviewButton).toBeInTheDocument();
  });

  it("`O` 버튼을 클릭하면 남은 단어 수가 1 감소하고 다음 단어를 보여준다.", () => {
    const { getByRole, vocabularyList } = renderVocabularyListTemplate();
    const numOfVocabularies = vocabularyList.vocabularies.length;
    const firstWordCard = getByRole("button", { expanded: false });
    const firstWord = firstWordCard.textContent;
    const skipButton = getByRole("button", { name: "O" });

    userEvent.click(skipButton);

    const secondWordCard = getByRole("button", { expanded: false });
    const secondWord = secondWordCard.textContent;
    const remainingWordsLen = getByRole("status");

    expect(firstWord).not.toBe(secondWord);
    expect(remainingWordsLen).toHaveTextContent(
      `남은 단어 수: ${numOfVocabularies - 1} / ${numOfVocabularies}`
    );
  });

  it("`X` 버튼을 클릭하면 해당 단어의 복습을 위해 남은 단어 수가 감소하지 않고 다음 단어를 보여준다.", () => {
    const { getByRole, vocabularyList } = renderVocabularyListTemplate();
    const numOfVocabularies = vocabularyList.vocabularies.length;
    const firstWordCard = getByRole("button", { expanded: false });
    const firstWord = firstWordCard.textContent;
    const reviewButton = getByRole("button", { name: "X" });

    userEvent.click(reviewButton);

    const secondWordCard = getByRole("button", { expanded: false });
    const secondWord = secondWordCard.textContent;
    const remainingWordsLen = getByRole("status");

    expect(firstWord).not.toBe(secondWord);
    expect(remainingWordsLen).toHaveTextContent(
      `남은 단어 수: ${numOfVocabularies} / ${numOfVocabularies}`
    );
  });

  it("모든 단어를 학습하면 `모든 단어를 학습했습니다!` 문구와 `재학습하기` 버튼이 렌더링된다.", () => {
    const { getByRole, getAllByRole, vocabularyList } =
      renderVocabularyListTemplate();
    const numOfVocabularies = vocabularyList.vocabularies.length;
    const skipButton = getByRole("button", { name: "O" });

    for (let i = 0; i < numOfVocabularies; i++) {
      userEvent.click(skipButton);
    }

    const endingMessage = getAllByRole("status").find(
      (status) => status.textContent === "모든 단어를 학습했습니다!"
    );
    expect(endingMessage).toBeInTheDocument();
    expect(getByRole("button", { name: "재학습하기" })).toBeInTheDocument();
  });

  it("모든 단어를 학습 후, `재학습하기` 버튼을 누르면 남은 단어 수가 초기화되고 학습할 카드가 렌더링된다.", () => {
    // given
    const { getByRole, getAllByRole, vocabularyList } =
      renderVocabularyListTemplate();
    const numOfVocabularies = vocabularyList.vocabularies.length;
    const skipButton = getByRole("button", { name: "O" });
    for (let i = 0; i < numOfVocabularies; i++) {
      userEvent.click(skipButton);
    }
    const reviewButton = getByRole("button", { name: "재학습하기" });
    const endingMessage = getAllByRole("status").find(
      (status) => status.textContent === "모든 단어를 학습했습니다!"
    );
    expect(endingMessage).toBeInTheDocument();

    // when
    userEvent.click(reviewButton);

    // then
    const remainingWords = getByRole("status");
    const wordCard = getByRole("button", { expanded: false });
    expect(remainingWords).toHaveTextContent(
      `남은 단어 수: ${numOfVocabularies} / ${numOfVocabularies}`
    );
    expect(wordCard).toBeInTheDocument();
  });
});
