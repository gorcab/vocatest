import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { GoPrimitiveDot } from "react-icons/go";
import { ImParagraphLeft } from "react-icons/im";
import { TiSortAlphabetically } from "react-icons/ti";
import { Disclosure } from "features/common/components/Disclosure/Disclosure";
import { DisclosureButton } from "features/common/components/Disclosure/DisclosureButton";
import { DisclosurePanel } from "features/common/components/Disclosure/DisclosurePanel";
import { useFlipCard } from "features/common/components/FlipCard/context/FlipCardContext";
import { FlipCardBack } from "features/common/components/FlipCard/FlipCardBack";
import { FlipCardFront } from "features/common/components/FlipCard/FlipCardFront";
import { Tab } from "features/common/components/Tab/Tab";
import { TabList } from "features/common/components/Tab/TabList";
import { TabPanel } from "features/common/components/Tab/TabPanel";
import { TabPanelList } from "features/common/components/Tab/TabPanelList";
import { Tabs } from "features/common/components/Tab/Tabs";
import { Tooltip } from "features/common/components/Tooltip/Tooltip";
import { Vocabulary, WrongVocabulary } from "../reducer/vocabularyListReducer";

type VocabularyProblemCardProps = {
  vocabulary: Vocabulary | WrongVocabulary;
};

export const VocabularyProblemCard: React.FC<VocabularyProblemCardProps> = ({
  vocabulary: { id, english, korean, examples },
}) => {
  const { flipCard } = useFlipCard(VocabularyProblemCard.name);
  const changeCardFace: React.MouseEventHandler<HTMLButtonElement> = () => {
    flipCard();
  };

  return (
    <div className="w-full">
      <AnimatePresence>
        <MotionConfig transition={{ duration: 0.5 }}>
          <motion.div
            layout
            key={id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ perspective: 600 }}
          >
            <div
              style={{ transformStyle: "preserve-3d" }}
              className="w-full h-[200px] relative"
            >
              <FlipCardFront>
                <div className="border rounded-md shadow-sm bg-white w-full h-full flex flex-col overflow-y-auto">
                  {examples && examples.length > 0 && (
                    <div className="flex items-center justify-end py-2 px-3 border-b">
                      <Tooltip title="예문 보기">
                        <button onClick={changeCardFace}>
                          <ImParagraphLeft className="text-gray-500" />
                        </button>
                      </Tooltip>
                    </div>
                  )}

                  <div className="flex justify-center items-center grow flex-col">
                    <Disclosure>
                      <DisclosureButton className="whitespace-normal">
                        {english}
                      </DisclosureButton>
                      <DisclosurePanel className="text-gray-600 whitespace-normal">
                        {korean}
                      </DisclosurePanel>
                    </Disclosure>
                  </div>
                </div>
              </FlipCardFront>
              {examples && examples.length > 0 ? (
                <FlipCardBack>
                  <div
                    className={`flex flex-col border rounded-md shadow-sm whitespace-normal bg-white w-full h-full absolute`}
                  >
                    <Tabs>
                      <div className="border-b flex flex-row w-full p-1">
                        <TabList className="overflow-x-scroll grow flex-nowrap">
                          {examples.map((example, index) => (
                            <Tab
                              className="p-2 basis-8 shrink-0 flex justify-center items-center"
                              key={example.id}
                            >
                              {(isSelected) => (
                                <>
                                  <GoPrimitiveDot
                                    className={`w-full h-full ${
                                      isSelected
                                        ? "text-blue-500"
                                        : "text-gray-400"
                                    }`}
                                  />
                                  <span className="sr-only">
                                    {index + 1}번째 예문
                                  </span>
                                </>
                              )}
                            </Tab>
                          ))}
                        </TabList>
                        <div className="flex items-center justify-end py-1 px-3">
                          <Tooltip title="단어 보기">
                            <button onClick={changeCardFace}>
                              <TiSortAlphabetically className="text-gray-500" />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                      <TabPanelList>
                        {examples.map((example) => (
                          <TabPanel
                            className="w-full h-full p-6 grow overflow-y-auto"
                            key={example.id}
                          >
                            <Disclosure>
                              <DisclosureButton className="text-xl text-left mb-2">
                                {example.sentence}
                              </DisclosureButton>
                              <DisclosurePanel className="text-gray-600 text-left">
                                {example.translation}
                              </DisclosurePanel>
                            </Disclosure>
                          </TabPanel>
                        ))}
                      </TabPanelList>
                    </Tabs>
                  </div>
                </FlipCardBack>
              ) : null}
            </div>
          </motion.div>
        </MotionConfig>
      </AnimatePresence>
    </div>
  );
};
