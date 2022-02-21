import { nanoid } from "@reduxjs/toolkit";
import { CreatedVocabularyDto } from "features/api/types";

export type Vocabulary = Omit<CreatedVocabularyDto, "id"> & {
  id: string;
};
export type WrongVocabulary = Vocabulary & {
  correctNumber: number;
};
type NextVocabularySet = "REST" | "WRONG" | null;

type State = {
  initialVocabularies: Array<CreatedVocabularyDto>;
  restVocabularies: Array<Vocabulary>;
  wrongVocabularies: Array<WrongVocabulary>;
  nextVocabularySet: NextVocabularySet;
};

type Action =
  | { type: "WRONG_VOCABULARY"; vocabulary: Vocabulary | WrongVocabulary }
  | { type: "RIGHT_VOCABULARY"; vocabulary: Vocabulary | WrongVocabulary }
  | { type: "RESET" };

export function shuffle<ArrType extends Array<any>>(arr: ArrType) {
  const shuffledArray = [...arr];
  shuffledArray.sort(() => Math.random() - 0.5);
  return shuffledArray;
}

export function initializeRestVocabularies(
  initialVocabularies: CreatedVocabularyDto[]
) {
  let shuffledRestVocabularies = [...initialVocabularies].map((vocabulary) => ({
    ...vocabulary,
    id: nanoid(),
  }));
  for (let i = 0; i < 20; ++i) {
    shuffledRestVocabularies = shuffle(shuffledRestVocabularies);
  }

  return shuffledRestVocabularies;
}

function selectNextVocabularySet(
  restVocabularies: Array<Vocabulary>,
  wrongVocabularies: Array<WrongVocabulary>
): NextVocabularySet {
  let nextVocabularySet: NextVocabularySet = null;
  if (restVocabularies.length > 0 && wrongVocabularies.length > 0) {
    if (wrongVocabularies.length > 2) {
      nextVocabularySet = Math.random() > 0.5 ? "REST" : "WRONG";
    } else {
      nextVocabularySet = "REST";
    }
  } else if (restVocabularies.length > 0) {
    nextVocabularySet = "REST";
  } else {
    nextVocabularySet = "WRONG";
  }
  return nextVocabularySet;
}

export function vocabularyListReducer(state: State, action: Action): State {
  const MAX_CORRECT_NUM = 3;
  switch (action.type) {
    case "WRONG_VOCABULARY": {
      const restVocabularies = [...state.restVocabularies];
      const wrongVocabularies = [...state.wrongVocabularies];
      let vocabulariesToRemove: Array<Vocabulary> | Array<WrongVocabulary>;
      let wrongVocabularyIndex: number = -1;
      let wrongVocabulary: WrongVocabulary;
      const id = nanoid();
      if ("correctNumber" in action.vocabulary) {
        wrongVocabularyIndex = wrongVocabularies.findIndex(
          (voca) => voca.id === action.vocabulary.id
        );
        vocabulariesToRemove = wrongVocabularies;
      } else {
        wrongVocabularyIndex = restVocabularies.findIndex(
          (voca) => voca.id === action.vocabulary.id
        );
        vocabulariesToRemove = restVocabularies;
      }
      wrongVocabulary = {
        ...action.vocabulary,
        id,
        correctNumber: 0,
      };

      if (wrongVocabularyIndex === -1) return { ...state };

      vocabulariesToRemove.splice(wrongVocabularyIndex, 1);
      const randomIndex = Math.floor(Math.random() * wrongVocabularies.length);
      wrongVocabularies.splice(randomIndex, 0, wrongVocabulary);

      const nextVocabularySet = selectNextVocabularySet(
        restVocabularies,
        wrongVocabularies
      );
      return {
        ...state,
        restVocabularies,
        wrongVocabularies,
        nextVocabularySet,
      };
    }

    case "RIGHT_VOCABULARY": {
      const restVocabularies = [...state.restVocabularies];
      const wrongVocabularies = [...state.wrongVocabularies];
      const id = nanoid();
      // 해당 단어가 이전에 틀린 단어인지 확인하기
      if ("correctNumber" in action.vocabulary) {
        const wrongVocabularyIndex = wrongVocabularies.findIndex(
          (voca) => voca.id === action.vocabulary.id
        );
        if (wrongVocabularyIndex === -1) return { ...state };
        // 틀린 단어였다면 correctNumber를 1 증가시키고 틀린 단어 집합에 다시 넣고 섞기
        const wrongVocabulary: WrongVocabulary = {
          ...action.vocabulary,
          id,
          correctNumber: action.vocabulary.correctNumber + 1,
        };
        if (wrongVocabulary.correctNumber === MAX_CORRECT_NUM) {
          wrongVocabularies.splice(wrongVocabularyIndex, 1);
        } else {
          wrongVocabularies.splice(wrongVocabularyIndex, 1);
          wrongVocabularies.push(wrongVocabulary);
        }
      } else {
        const vocabularyIndex = restVocabularies.findIndex(
          (voca) => voca.id === action.vocabulary.id
        );
        if (vocabularyIndex === -1) return { ...state };
        restVocabularies.splice(vocabularyIndex, 1);
      }
      const nextVocabularySet = selectNextVocabularySet(
        restVocabularies,
        wrongVocabularies
      );
      return {
        ...state,
        restVocabularies,
        wrongVocabularies,
        nextVocabularySet,
      };
    }

    case "RESET": {
      const nextVocabularySet: NextVocabularySet = "REST";
      const restVocabularies = initializeRestVocabularies(
        state.initialVocabularies
      );
      const wrongVocabularies: Array<WrongVocabulary> = [];

      return {
        ...state,
        nextVocabularySet,
        restVocabularies,
        wrongVocabularies,
      };
    }
    default: {
      throw new TypeError(`unexpected Action: ${action}`);
    }
  }
}
