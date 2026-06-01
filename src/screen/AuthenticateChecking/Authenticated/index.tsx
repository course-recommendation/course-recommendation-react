import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import useGet from '@/common/hooks/network/useGet';
import { Algorithm } from '@/common/types/Course.types';
import { User } from '@/common/types/User.types';
import { Spin } from 'antd';
import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router';

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

    // Admins should be redirected to /admin and do not go through survey
    if (isAdmin) {
      if (pathname !== '/admin') {
        navigate('/admin', { replace: true });
      }
      return;
    }

    const isFirstLogin = isFirstLoginResponse!.data;
    const isSurveyPage = pathname === '/survey';

    if (isFirstLogin && !isSurveyPage) {
      navigate('/survey', { replace: true });
      return;
    }

    if (!isFirstLogin && isSurveyPage) {
      navigate('/', { replace: true });
    }
  }, [firstLoginPending, isFirstLoginResponse, mePending, navigate, pathname, isAdminPending]);

  if (mePending || firstLoginPending || isAdminPending) {
    return <Spin fullscreen />;
  }

  return <Outlet context={{ me: meResponse!.data, isFirstLogin: isFirstLoginResponse!.data, isAdmin: isAdminResponse!.data }} />;
}
