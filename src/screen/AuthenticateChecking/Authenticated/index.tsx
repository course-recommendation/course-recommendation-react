import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import useGet from '@/common/hooks/network/useGet';
import { Algorithm } from '@/common/types/Course.types';
import { User } from '@/common/types/User.types';
import { Spin } from 'antd';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

export default function Authenticated() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const algorithm = useAlgorithmContext();

  const { data: meResponse, isPending: mePending } = useGet<User>(`/me`);
  const { data: isFirstLoginResponse, isPending: firstLoginPending } = useGet<boolean>(
    '/me/first-login',
    {
      params: {
        algorithm,
      } as { algorithm: Algorithm },
    },
  );
  const { data: isAdminResponse, isPending: isAdminPending } = useGet<boolean>('/admin/is-admin');

  useEffect(() => {
    if (mePending || firstLoginPending || isAdminPending) {
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
    firstLoginPending,
    mePending,
    navigate,
    pathname,
    isAdminPending,
    isAdminResponse,
  ]);

  if (mePending || firstLoginPending || isAdminPending) {
    return <Spin fullscreen />;
  }

  return (
    <Outlet
      context={{
        me: meResponse!.data,
        isFirstLogin: isFirstLoginResponse!.data,
        isAdmin: isAdminResponse!.data,
      }}
    />
  );
}
