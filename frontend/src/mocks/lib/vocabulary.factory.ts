import faker from "@faker-js/faker";
import {
  CategoryDto,
  CreatedExampleDto,
  CreatedVocabularyDto,
  CreateVocabularyDto,
  CreateVocabularyListDto,
  DetailedVocabularyListDto,
  ExampleDto,
  PagedVocabularyListsResponse,
  VocabularyListDto,
} from "features/api/types";
import { mockCategories as categories } from "./category.factory";

function createVocabulary(
  id: number,
  vocabularyDto?: CreateVocabularyDto
): CreatedVocabularyDto {
  if (vocabularyDto) {
    const { english, korean, examples } = vocabularyDto;
    const createdExamples: Array<CreatedExampleDto> = examples.map(
      (example, index) => createExample(index + 1, example)
    );
    const vocabulary: CreatedVocabularyDto = {
      id,
      english,
      korean,
      examples: createdExamples,
    };

    return vocabulary;
  } else {
    const isCreatingExample = Math.random() > 0.2 ? true : false;
    let examples: Array<CreatedExampleDto> = [];
    if (isCreatingExample) {
      const numOfExamples = Math.floor(Math.random() * 5) + 3;
      examples = Array.from({ length: numOfExamples }).map((_, index) =>
        createExample(index + 1)
      );
    }
    const koreanLen = faker.locales.ko?.lorem?.words?.length ?? 0;
    const vocabulary: CreatedVocabularyDto = {
      id,
      english: faker.word.noun(),
      korean:
        faker.locales.ko?.lorem?.words?.[Math.floor(Math.random() * koreanLen)],
      examples: examples,
    };

    return vocabulary;
  }

  function createExample(
    id: number,
    createExampleDto?: ExampleDto
  ): CreatedExampleDto {
    let example: CreatedExampleDto;
    if (createExampleDto) {
      const { sentence, translation } = createExampleDto;
      example = {
        id,
        sentence,
        translation,
      };
    } else {
      const koreanLen = faker.locales.ko?.lorem?.words?.length || 0;
      example = {
        id,
        sentence: faker.lorem.sentence(),
        translation:
          faker.locales.ko?.lorem?.words?.[
            Math.floor(Math.random() * koreanLen)
          ],
      };
    }

    return example;
  }
}

export function createVocabularies(
  vocabularies?: Array<CreateVocabularyDto>
): Array<CreatedVocabularyDto> {
  if (vocabularies) {
    return vocabularies.map((vocabulary, index) =>
      createVocabulary(index + 1, vocabulary)
    );
  } else {
    const numOfVocabularies = Math.floor(Math.random() * 50) + 3;
    const vocabularies = Array.from({ length: numOfVocabularies }).map(
      (_, index) => createVocabulary(index + 1)
    );
    return vocabularies;
  }
}

type VocabularyListDtoWithVocabularies = VocabularyListDto & {
  vocabularies: Array<CreatedVocabularyDto>;
};

export function createMockVocabularyListsInEachCategory() {
  function createVocabularyListDtoWithVocabularies({
    category,
    vocabularies,
    startId,
  }: {
    category: CategoryDto;
    vocabularies: Array<CreatedVocabularyDto>;
    startId: number;
  }): Array<VocabularyListDtoWithVocabularies> {
    const result: Array<VocabularyListDtoWithVocabularies> = [];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    for (let i = 0; i < vocabularies.length; i++) {
      result.push({
        id: startId + i,
        title: `${category.name} DAY-${i + 1}`,
        category,
        createdAt: faker.datatype
          .datetime({
            max: yesterday.getMilliseconds(),
          })
          .toISOString(),
        numOfVocabularies: vocabularies.length,
        vocabularies,
      });
    }
    return result;
  }

  const result: {
    [categoryId: string]: Array<VocabularyListDtoWithVocabularies>;
  } = categories.reduce(
    (acc, cur, categoryIndex, categories) => {
      const startId =
        categoryIndex > 0
          ? Math.max(
              ...acc[categories[categoryIndex - 1].id].map(
                (vocaList) => vocaList.id
              )
            ) + 1
          : 1;

      const result = createVocabularyListDtoWithVocabularies({
        category: categories[categoryIndex],
        vocabularies: createVocabularies(),
        startId,
      }).sort((list1, list2) => {
        const createdAt1 = new Date(list1.createdAt);
        const createdAt2 = new Date(list2.createdAt);
        if (createdAt1 < createdAt2) return 1;
        else if (createdAt1 === createdAt2) return 0;
        else return -1;
      });

      acc[cur.id] = result;
      return acc;
    },
    {} as {
      [categoryId: string]: Array<VocabularyListDtoWithVocabularies>;
    }
  );

  return result;
}

export function getEntireVocabularyLists(
  vocabularyListsRecord: Record<
    string,
    Array<VocabularyListDtoWithVocabularies>
  >
) {
  return Object.keys(vocabularyListsRecord)
    .reduce(
      (acc, cur) => [...acc, ...vocabularyListsRecord[Number(cur)]],
      [] as Array<VocabularyListDtoWithVocabularies>
    )
    .sort((elem1, elem2) => {
      const elem1Date = new Date(elem1.createdAt);
      const elem2Date = new Date(elem2.createdAt);
      if (elem1Date < elem2Date) return 1;
      else if (elem1Date === elem2Date) return 0;
      else return -1;
    });
}

export function deleteVocabularyListById(
  vocabularyListsRecord: Record<
    string,
    Array<VocabularyListDtoWithVocabularies>
  >,
  id: number
): Record<string, Array<VocabularyListDtoWithVocabularies>> {
  const result: Record<string, Array<VocabularyListDtoWithVocabularies>> = {};
  for (const [categoryId, vocabularyLists] of Object.entries(
    vocabularyListsRecord
  )) {
    const newVocaLists = vocabularyLists.filter((list) => list.id !== id);
    result[categoryId] = newVocaLists;
  }
  return result;
}

export function getPageBasedVocabularyLists(
  vocabularyLists: Array<VocabularyListDtoWithVocabularies>,
  page: number,
  perPage: number
): PagedVocabularyListsResponse {
  const firstIndex = perPage * (page - 1);
  const lastIndex = firstIndex + perPage;
  const data = vocabularyLists.slice(firstIndex, lastIndex);
  const total = vocabularyLists.length;
  const totalPage = Math.ceil(total / perPage);

  return {
    data,
    page,
    perPage,
    total,
    totalPage,
  };
}

export function addVocabularyList(
  vocabularyListsRecord: Record<
    string,
    Array<VocabularyListDtoWithVocabularies>
  >,
  {
    categoryId,
    vocabularies,
    title,
  }: Omit<CreateVocabularyListDto, "vocabularies"> & {
    vocabularies: Array<CreatedVocabularyDto>;
  }
): Record<string, Array<VocabularyListDtoWithVocabularies>> {
  const newVocabularyListsRecord = Object.assign({}, vocabularyListsRecord);
  const vocabularyListsOfCategory = newVocabularyListsRecord[categoryId];
  const id =
    Math.max(...vocabularyListsOfCategory.map((vocaList) => vocaList.id)) + 1;
  vocabularyListsOfCategory.unshift({
    id,
    createdAt: new Date().toISOString(),
    category: vocabularyListsOfCategory[0].category,
    numOfVocabularies: vocabularies.length,
    title,
    vocabularies,
  });

  return newVocabularyListsRecord;
}

export function createMockVocabularyList() {
  function createMockExample(id: number) {
    const numOfTranslation = faker.locales.ko?.lorem?.words?.length ?? 0;
    const exampleDto: CreatedExampleDto = {
      id,
      sentence: faker.lorem.sentence(),
      translation:
        faker.locales.ko?.lorem?.words?.[
          Math.floor(Math.random() * numOfTranslation)
        ],
    };
    return exampleDto;
  }

  function createMockVocabulary(
    id: number,
    vocabularies: Array<CreatedVocabularyDto>
  ) {
    function createUniqueEnglish(): string {
      const english = faker.lorem.word();
      if (vocabularies.some((voca) => voca.english === english)) {
        return createUniqueEnglish();
      }
      return english;
    }

    const numOfkorean = faker.locales.ko?.word?.noun?.length ?? 0;
    let english = createUniqueEnglish();
    const vocabulary: CreatedVocabularyDto = {
      id,
      english,
      korean:
        faker.locales.ko?.word?.noun?.[Math.floor(Math.random() * numOfkorean)],
      examples: Array.from({ length: Math.floor(Math.random() * 4) + 1 }).map(
        (_, index) => createMockExample(index + 1)
      ),
    };
    vocabularies.push(vocabulary);
    return;
  }

  const vocabularies: Array<CreatedVocabularyDto> = [];
  let id = 1;
  while (vocabularies.length <= 10) {
    createMockVocabulary(id, vocabularies);
    id++;
  }

  const vocabularyList: DetailedVocabularyListDto = {
    id: faker.datatype.number(),
    title: faker.lorem.sentence(3),
    category: {
      id: faker.datatype.number(),
      name: faker.datatype.string(),
    },
    createdAt: faker.datatype.datetime().toISOString(),
    vocabularies,
  };

  return vocabularyList;
}
