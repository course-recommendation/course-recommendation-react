import { User } from '@/common/types/User.types';
import { createContext, useContext } from 'react';

export type MeContextType = {
  me: User;
};

export const MeContext = createContext<MeContextType>({
  me: null!,
});

export function useMeContext() {
  return useContext(MeContext);
}
