import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import { useTenantName } from '@/common/hooks/useTenantName';
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
  const tenantName = useTenantName();

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
    const isSurveyPage = pathname === `/${tenantName}/survey`;

    if (isFirstLogin && !isSurveyPage) {
      navigate(`/${tenantName}/survey`, { replace: true });
      return;
    }

    if (!isFirstLogin && isSurveyPage) {
      navigate(`/${tenantName}`, { replace: true });
    }
  }, [firstLoginPending, isFirstLoginResponse, mePending, navigate, pathname, tenantName]);

  return mePending || firstLoginPending ? (
    <Spin fullscreen />
  ) : (
    <Outlet context={{ me: meResponse!.data, isFirstLogin: isFirstLoginResponse!.data }} />
  );
}
