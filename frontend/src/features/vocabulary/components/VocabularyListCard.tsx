import { useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { CategoryDto } from "../../api/types";
import { Card } from "../../common/components/Card";
import { Dropdown } from "../../common/components/Dropdown";
import { DropdownButton } from "../../common/components/DropdownButton";
import { DropdownItem } from "../../common/components/DropdownItem";
import { DropdownList } from "../../common/components/DropdownList";
import { getFormattedDate } from "../../common/utils/helper";
import { DeleteVocabularyListModal } from "./DeleteVocabularyListModal";

type VocabularyListCardProps = {
  id: number;
  title: string;
  numOfVocabularies: number;
  createdAt: string;
  category: CategoryDto;
};

export const VocabularyListCard: React.FC<VocabularyListCardProps> = ({
  id,
  title,
  numOfVocabularies,
  createdAt,
  category,
}) => {
  const navigate = useNavigate();
  const formattedDate = getFormattedDate(new Date(createdAt));
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const openModalHandler: React.MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    event.preventDefault();
    setShowDeleteModal(true);
  };
  const closeModalHandler = () => setShowDeleteModal(false);
  const navigateToEditVocabularyListPage: React.MouseEventHandler<HTMLButtonElement> =
    (event) => {
      event.preventDefault();
      navigate(`/edit-vocabulary/${id}`);
    };

  return (
    <>
      <Card
        as="li"
        className="transform-gpu hover:-translate-y-1 hover:shadow-blue-200 duration-200"
      >
        <Link
          to={`/vocabularies/${id}`}
          className="h-full p-3 w-full absolute top-1 left-1"
        >
          <div className="relative flex justify-between items-center">
            <h3 className="font-bold">{title}</h3>
            <Dropdown id={id}>
              <DropdownButton className="text-slate-500 hover:text-blue-500 p-2">
                <FaEllipsisV />
              </DropdownButton>
              <DropdownList>
                <DropdownItem as="button" onClick={openModalHandler}>
                  단어장 삭제
                </DropdownItem>
                <DropdownItem
                  as="button"
                  onClick={navigateToEditVocabularyListPage}
                >
                  단어장 수정
                </DropdownItem>
              </DropdownList>
            </Dropdown>
          </div>
          <div className="text-sm text-slate-500 mb-3">{formattedDate}</div>
          <div className="text-sm">{numOfVocabularies} 단어</div>
        </Link>
        <Link
          to={`/categories/${category.id}`}
          className="hover:text-blue-500 absolute bottom-1 p-3 left-1"
        >
          {category.name}
        </Link>
      </Card>
      <DeleteVocabularyListModal
        title={title}
        vocabularyListId={id}
        isOpen={showDeleteModal}
        onClose={closeModalHandler}
      />
    </>
  );
};
