import { createContext, useContext } from 'react';

export const ShowExplanationContext = createContext<boolean>(true);

export function useShowExplanationContext() {
  return useContext(ShowExplanationContext);
}
