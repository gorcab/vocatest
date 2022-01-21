import { useSearchParams } from "react-router-dom";
import { CategoryPageTemplate } from "../features/category/components/CategoryPageTemplate";
import { MainPageTemplate } from "../features/common/components/MainPageTemplate";

export const MainPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryId = Number(searchParams.get("category"));

  if (categoryId) {
    return <CategoryPageTemplate />;
  }

  return <MainPageTemplate />;
};
