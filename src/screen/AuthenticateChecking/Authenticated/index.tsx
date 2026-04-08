import useGet from '@/common/hooks/network/useGet';
import { User } from '@/common/types/User.types';
import { Spin } from 'antd';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { MeContext } from './context/MeContext';

export default function Authenticated() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { data: meResponse, isPending: mePending } = useGet<User>(`/me`);

  useEffect(() => {
    if (mePending) {
      return;
    }

    const didSurvey = meResponse!.data.didSurvey;
    const isSurveyPage = pathname === '/survey';

    if (!didSurvey && !isSurveyPage) {
      navigate('/survey', { replace: true });
      return;
    }

    if (didSurvey && isSurveyPage) {
      navigate('/', { replace: true });
    }
  }, [mePending, meResponse, navigate, pathname]);

  return mePending ? (
    <Spin fullscreen />
  ) : (
    <MeContext value={{ me: meResponse!.data }}>
      <Outlet />
    </MeContext>
  );
}
