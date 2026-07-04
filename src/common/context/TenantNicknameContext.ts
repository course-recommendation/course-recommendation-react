import { createContext, useContext } from 'react';
import { TenantNickname } from '../types/Tenant.types';

export type TenantNicknameContext = TenantNickname | undefined;

export const TenantNicknameContext = createContext<TenantNicknameContext>(undefined);

export function useTenantNicknameContext() {
  return useContext(TenantNicknameContext);
}
