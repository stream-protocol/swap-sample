import { useEffect, useRef } from 'react';

import { areShallowEqual, areShallowShallowEqual } from '../functions/judgers/areEqual';
import { isFunction } from '../functions/judgers/dateType';

/**
 * similiar to React.useEffect, but can record dependence list
 *
 * if clean fn is promise<function>, it will just ignore it
 *
 * cost:
 * - 1 `React.useEffect()`
 * - 2 `React.useRef()`
 */
export function useRecordedEffect<T extends readonly any[]>(
  effectFn: (prevDependenceList: T | undefined[]) => ((...params: any) => any) | any,
  dependenceList: T,
  options?: {
    /**useful when item of dependenceList is object */
    shallowShallow?: boolean;
  }
) {
  const prevValue = useRef<T>([] as unknown as T);
  const cleanupFn = useRef<(() => void) | void>();
  const compareFunction = options?.shallowShallow ? areShallowShallowEqual : areShallowEqual;
  useEffect(() => {
    if (prevValue.current.length && compareFunction(prevValue.current, dependenceList))
      return isFunction(cleanupFn.current) ? cleanupFn.current : undefined;
    const returnedFn = effectFn(prevValue.current);
    prevValue.current = dependenceList;
    cleanupFn.current = returnedFn;
    return isFunction(returnedFn) ? returnedFn : undefined;
  }, dependenceList);
}
