import useGet from '@/common/hooks/network/useGet';
import { User } from '@/common/types/User.types';
import { Spin } from 'antd';
import { Outlet } from 'react-router';
import { MeContext } from './context/MeContext';

export default function Authenticated() {
  const { data: meResponse, isPending: mePending } = useGet<User>(`/me`);

  return mePending ? (
    <Spin fullscreen />
  ) : (
    <MeContext value={{ me: meResponse!.data }}>
      <Outlet />
    </MeContext>
  );
}
