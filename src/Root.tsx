import { App, Spin } from 'antd';
import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { AlgorithmContext } from './common/context/AlgorithmContext';
import { TenantNicknameContext } from './common/context/TenantNicknameContext';
import useGet from './common/hooks/network/useGet';
import { Algorithm } from './common/types/Course.types';
import { TenantNickname } from './common/types/Tenant.types';
import './index.css';

const DEFAULT_TITLE = 'CoursePilot';

function Root() {
  const { data: algorithmResponse, isPending: algorithmPending } =
    useGet<Algorithm>(`/tenant/algorithm`);

  const { data: tenantNicknameResponse } = useGet<TenantNickname>('/tenant/nickname');
  const tenantNickname = tenantNicknameResponse?.data;

  useEffect(() => {
    document.title =
      tenantNickname?.showNickname && tenantNickname.nickname
        ? tenantNickname.nickname
        : DEFAULT_TITLE;
  }, [tenantNickname]);

  if (algorithmPending) return <Spin fullscreen />;

  return (
    <App>
      <AlgorithmContext value={algorithmResponse!.data}>
        <TenantNicknameContext value={tenantNickname}>
          <Outlet />
        </TenantNicknameContext>
      </AlgorithmContext>
    </App>
  );
}

export default Root;
