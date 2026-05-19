import useGet from '@/common/hooks/network/useGet';
import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import { Algorithm } from '@/common/types/Course.types';
import { User } from '@/common/types/User.types';
import { Spin } from 'antd';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { MeContext } from './context/MeContext';

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

  useEffect(() => {
    if (mePending || firstLoginPending) {
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
  }, [firstLoginPending, isFirstLoginResponse, mePending, navigate, pathname]);

  return mePending || firstLoginPending ? (
    <Spin fullscreen />
  ) : (
    <MeContext value={{ me: meResponse!.data, isFirstLogin: isFirstLoginResponse!.data }}>
      <Outlet />
    </MeContext>
  );
}
