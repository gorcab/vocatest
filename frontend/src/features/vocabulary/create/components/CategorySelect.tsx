import { CategoryDto } from "features/api/types";
import { Select } from "features/common/components/Select/Select";
import { SelectButton } from "features/common/components/Select/SelectButton";
import { SelectLabel } from "features/common/components/Select/SelectLabel";
import { SelectListBox } from "features/common/components/Select/SelectListBox";
import { SelectOption } from "features/common/components/Select/SelectOption";
import { FaCaretDown } from "react-icons/fa";
type CategorySelectProps = {
  categories: Array<CategoryDto>;
  onBlur: (value: number) => void;
  onChange: (value: number) => void;
  value: number;
};

export const CategorySelect: React.FC<CategorySelectProps> = ({
  categories,
  value,
  onBlur,
  onChange,
}) => {
  const selectedCategory = categories.find((category) => category.id === value);
  const buttonClassName = `border-b border-slate-400 flex justify-between items-center w-full h-6 text-left outline-none focus:border-b-blue-500 ${
    value ? "text-black" : "text-gray-500"
  }`;
  return (
    <Select onChange={onChange} value={value}>
      <SelectLabel className="pb-2">카테고리</SelectLabel>
      <SelectButton className={buttonClassName} onBlur={onBlur}>
        <span>
          {selectedCategory ? selectedCategory.name : "카테고리를 선택하세요."}
        </span>
        <span>
          <FaCaretDown />
        </span>
      </SelectButton>
      <SelectListBox className="bg-white absolute py-1 shadow-lg rounded-md z-10 outline-none truncate">
        {categories.map((category) => (
          <SelectOption
            key={category.id}
            value={category.id}
            className="cursor-pointer px-1 py-3 text-gray-600 outline-none focus:bg-gray-200 hover:bg-gray-100"
          >
            {category.name}
          </SelectOption>
        ))}
      </SelectListBox>
    </Select>
  );
};
