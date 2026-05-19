import { User } from '@/common/types/User.types';
import { createContext, useContext } from 'react';

export type MeContextType = {
  me: User;
  isFirstLogin: boolean;
};

export const MeContext = createContext<MeContextType>({
  me: null!,
  isFirstLogin: false,
});

export function useMeContext() {
  return useContext(MeContext);
}
