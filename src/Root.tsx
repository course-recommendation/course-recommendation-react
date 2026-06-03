import { App, Spin } from 'antd';
import { Outlet } from 'react-router';
import { AlgorithmContext } from './common/context/AlgorithmContext';
import useGet from './common/hooks/network/useGet';
import { Algorithm } from './common/types/Course.types';
import './index.css';

function Root() {
  const { data: algorithmResponse, isPending: algorithmPending } =
    useGet<Algorithm>(`/tenant/algorithm`);

  if (algorithmPending) return <Spin fullscreen />;

  return (
    <App>
      <AlgorithmContext value={algorithmResponse!.data}>
        <Outlet />
      </AlgorithmContext>
    </App>
  );
}

export default Root;
