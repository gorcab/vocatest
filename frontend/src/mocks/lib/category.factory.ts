import {
  CategoryDto,
  CreateCategoryRequest,
  EditCategoryRequest,
} from "features/api/types";

export const mockCategories: Array<CategoryDto> = [
  { id: 1, name: "TOEIC" },
  { id: 2, name: "TEPS" },
  { id: 3, name: "TOFEL" },
];

export function createCategory(
  categories: Array<CategoryDto>,
  { name }: CreateCategoryRequest
) {
  const categoryDto: CategoryDto = {
    id: categories[categories.length - 1].id + 1,
    name,
  };
  return categories.concat(categoryDto);
}

export function findCategoryIndex(
  categories: Array<CategoryDto>,
  predicate: (category: CategoryDto) => boolean
) {
  return categories.findIndex(predicate);
}

export function editCategory(
  categories: Array<CategoryDto>,
  { id, name }: EditCategoryRequest
) {
  const newCategories = [...categories];
  let categoryIndex = findCategoryIndex(
    newCategories,
    (category) => category.id === id
  );
  if (categoryIndex !== -1) {
    newCategories[categoryIndex] = {
      ...newCategories[categoryIndex],
      name,
    };
  }
  return newCategories;
}

export function deleteCategory(categories: Array<CategoryDto>, id: number) {
  const newCategories = [...categories];
  const categoryIndex = findCategoryIndex(
    newCategories,
    (category) => category.id === id
  );
  if (categoryIndex !== -1) {
    newCategories.splice(categoryIndex, 1);
  }
  return newCategories;
}
