import { User } from '@/common/types/User.types';
import { createContext, useContext } from 'react';

export type MeContextType = {
  me: User;
  isAdmin: boolean;
};

export const MeContext = createContext<MeContextType>({
  me: null!,
  isAdmin: false,
});

export function useMeContext() {
  return useContext(MeContext);
}
