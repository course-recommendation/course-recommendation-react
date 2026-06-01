import { User } from '@/common/types/User.types';
import { createContext, useContext } from 'react';

export type MeContextType = {
  me: User;
  isFirstLogin: boolean;
  isAdmin: boolean;
};

export const MeContext = createContext<MeContextType>({
  me: null!,
  isFirstLogin: false,
  isAdmin: false,
});

export function useMeContext() {
  return useContext(MeContext);
}
