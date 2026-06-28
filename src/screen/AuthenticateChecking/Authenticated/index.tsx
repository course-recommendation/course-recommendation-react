import useGet from '@/common/hooks/network/useGet';
import { User } from '@/common/types/User.types';
import { Spin } from 'antd';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

export default function Authenticated() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { data: meResponse, isPending: mePending } = useGet<User>(`/me`);
  const { data: isAdminResponse, isPending: isAdminPending } = useGet<boolean>('/admin/is-admin');

  useEffect(() => {
    if (mePending || isAdminPending) {
      return;
    }

    const isAdmin = isAdminResponse!.data;

    // Admins land on /admin by default, but can navigate to other pages
    if (isAdmin) {
      if (pathname === '/' || pathname === '') {
        navigate('/admin', { replace: true });
      }
      return;
    }
  }, [
    mePending,
    navigate,
    pathname,
    isAdminPending,
    isAdminResponse,
  ]);

  if (mePending || isAdminPending) {
    return <Spin fullscreen />;
  }

  return (
    <Outlet
      context={{
        me: meResponse!.data,
        isAdmin: isAdminResponse!.data,
      }}
    />
  );
}
