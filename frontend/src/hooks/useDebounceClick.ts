import debounce from "debounce";
import {useCallback} from "react";

export const useDebounceClick = (onClickHandler: () => any) => {
  const debounceClick = debounce(onClickHandler, 300, { immediate: true});
  return useCallback(debounceClick, [onClickHandler]);
}