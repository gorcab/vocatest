import { Category } from 'src/category/entities/category.entity';
import { User } from 'src/user/entities/user.entity';
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
  example.sentence = '영문장 ' + getRandomId();
  example.translation = '번역 ' + getRandomId();
  example.vocabulary = null;

  return example;
};

export const createVocabulary = (examples?: Array<Example>) => {
  const vocabulary = new Vocabulary();
  vocabulary.id = getRandomId();
  vocabulary.english = '영단어 ' + getRandomId();
  vocabulary.korean = '뜻' + getRandomId();
  examples?.length > 0 && (vocabulary.examples = Promise.resolve(examples));
  vocabulary.vocabularyList = null;

  return vocabulary;
};

export const createVocabularyList = (
  category: Category,
  vocabularies?: Array<Vocabulary>,
) => {
  const vocabularyList = new VocabularyList();
  vocabularyList.id = getRandomId();
  vocabularyList.createdAt = new Date();
  vocabularyList.title = '영단어장 ' + getRandomId();
  vocabularyList.category = category;
  vocabularies?.length > 0 &&
    (vocabularyList.vocabularies = Promise.resolve(vocabularies));

  return vocabularyList;
};
