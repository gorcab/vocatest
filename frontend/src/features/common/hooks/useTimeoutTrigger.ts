import { useEffect, useState } from "react";

type Callback = () => void;

type OptionType =
  | {
      isSetTimeout: true;
      ttl: number;
    }
  | { isSetTimeout: false };

export const useTimeoutTrigger = (trigger: Callback, option: OptionType) => {
  const [isSet, setIsSet] = useState<boolean>(option.isSetTimeout);
  const [ttl, setTtl] = useState<number>(Number.MIN_SAFE_INTEGER);

  useEffect(() => {
    if (option.isSetTimeout === true && ttl === Number.MIN_SAFE_INTEGER) {
      setTtl(option.ttl);
      setIsSet(true);
    }
  }, [option, ttl]);

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;
    if (isSet) {
      if (ttl !== Number.MIN_SAFE_INTEGER) {
        if (ttl >= 1) {
          timerId = setTimeout(() => {
            setTtl((prev) => prev - 1);
          }, 1000);

          return () => {
            if (timerId) {
              clearTimeout(timerId);
            }
          };
        } else {
          setIsSet(false);
          setTtl(Number.MIN_SAFE_INTEGER);
          trigger();
        }
      }
    }
  }, [ttl, trigger, isSet]);

  return { ttl, isSet } as const;
};
