import { StatsigProvider, useClientAsyncInit } from '@statsig/react-bindings';
import { Spin } from 'antd';
import { Outlet, useOutletContext } from 'react-router';
import { MeContext, MeContextType } from './context/MeContext';

export default function AuthenticatedStatsig() {
  const { me, isFirstLogin, isAdmin } = useOutletContext<MeContextType>();
  const { client } = useClientAsyncInit(
    'client-He66Rqt8SmdRDA1cwWGzAAnYGiohDkJFTmSaCBLmZhh',
    { userID: me.id },
    {
      plugins: [],
      // environment: { tier: 'development' }
    },
  );

  return (
    <StatsigProvider client={client} loadingComponent={<Spin fullscreen />}>
      <MeContext value={{ me, isFirstLogin, isAdmin }}>
        <Outlet />
      </MeContext>
    </StatsigProvider>
  );
}
