import { CategoryItem } from "./CategoryItem";

export const CategoryList: React.FC = () => {
  const categories = [
    { id: 1, name: "토익" },
    { id: 2, name: "텝스" },
    { id: 3, name: "토플" },
  ];

  return (
    <ul className="flex flex-col mt-3">
      {categories.map(({ id, name }) => (
        <CategoryItem
          key={id}
          id={id}
          name={name}
          path={`categories/${id}`}
        ></CategoryItem>
      ))}
    </ul>
  );
};
