import { CategoryDto } from 'src/category/dtos/Category.dto';
import { Category } from 'src/category/entities/category.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateVocabularyDto } from 'src/vocabulary/dtos/CreateVocabulary.dto';
import { Example } from 'src/vocabulary/entities/Example.entity';
import { Vocabulary } from 'src/vocabulary/entities/Vocabulary.entity';
import { VocabularyList } from 'src/vocabulary/entities/VocabularyList.entity';

function getRandomId(): number {
  return Math.floor(Math.random() * 100);
}

export const createUser = () => {
  const user = new User();
  user.id = getRandomId();
  user.email = `test${getRandomId()}@gmail.com`;
  user.password = 'test1234';
  user.nickname = 'tester';
  user.createdAt = new Date();
  user.categories = null;

  return user;
};

export const createCategory = (user?: User) => {
  const category = new Category();
  category.user = user;
  category.id = getRandomId();
  category.name = '카테고리 ' + getRandomId();
  category.vocabularyLists = null;

  return category;
};

export const createExample = () => {
  const example = new Example();
  example.id = getRandomId();
  example.sentence = '영문장 ' + example.id;
  example.translation = '번역 ' + example.id;
  example.vocabulary = null;

  return example;
};

export const createVocabulary = (examples?: Array<Example>) => {
  const vocabulary = new Vocabulary();
  vocabulary.id = getRandomId();
  vocabulary.english = '영단어 ' + vocabulary.id;
  vocabulary.korean = '뜻' + vocabulary.id;
  vocabulary.examples = Promise.resolve(examples);
  vocabulary.vocabularyList = null;

  return vocabulary;
};

export const createVocabularyList = (
  { id, name }: CategoryDto,
  vocabularies?: Array<Vocabulary>,
) => {
  const category = new Category();
  category.id = id;
  category.name = name;

  const vocabularyList = new VocabularyList();
  vocabularyList.id = getRandomId();
  vocabularyList.createdAt = new Date();
  vocabularyList.title = '영단어장 ' + vocabularyList.id;
  vocabularyList.category = category;
  vocabularyList.vocabularies = vocabularies;

  vocabularies?.forEach(
    (vocabulary) => (vocabulary.vocabularyList = vocabularyList),
  );

  return vocabularyList;
};

export const createCreateVocabularyDtos = (): Array<CreateVocabularyDto> => {
  const createVocabularyDtos: Array<CreateVocabularyDto> = [
    {
      english: 'apple',
      korean: '사과',
      examples: [
        {
          sentence: 'He ate the apple',
          translation: '그는 사과를 먹었다.',
        },
        {
          sentence: 'Sling me an apple, will you?',
          translation: '나한테 사과를 던져줄래?',
        },
      ],
    },
    {
      english: 'banana',
      korean: '바나나',
      examples: [
        {
          sentence: 'I hate banana',
          translation: '나는 바나나가 싫다.',
        },
      ],
    },
    {
      english: 'dog',
      korean: '개',
    },
  ];

  return createVocabularyDtos;
};

export const createVocabularyLists = (): Array<Array<CreateVocabularyDto>> => {
  const vocabularyLists: Array<Array<CreateVocabularyDto>> = [
    [
      {
        english: 'apple',
        korean: '사과',
        examples: [
          {
            sentence: 'He ate the apple',
            translation: '그는 사과를 먹었다.',
          },
          {
            sentence: 'Sling me an apple, will you?',
            translation: '나한테 사과를 던져줄래?',
          },
        ],
      },
    ],
    [
      {
        english: 'banana',
        korean: '바나나',
        examples: [
          {
            sentence: 'I hate banana',
            translation: '나는 바나나가 싫다.',
          },
        ],
      },
    ],
    [
      {
        english: 'dog',
        korean: '개',
      },
    ],
    [
      {
        english: 'dictionary',
        korean: '사전',
      },
    ],
    [
      {
        english: 'word',
        korean: '단어',
      },
    ],
    [
      {
        english: 'grammar',
        korean: '문법',
      },
    ],
    [
      {
        english: 'pronounciation',
        korean: '발음',
      },
    ],
    [
      {
        english: 'confidence',
        korean: '자신감',
      },
    ],
    [
      {
        english: 'challenge',
        korean: '도전',
      },
    ],
    [
      {
        english: 'hope',
        korean: '희망',
      },
    ],
    [
      {
        english: 'future',
        korean: '미래',
      },
      {
        english: 'korea',
        korean: '대한민국',
      },
    ],
  ];

  return vocabularyLists;
};
