import { LocalStorageKey } from '@/common/constants/LocalStorageKey';
import { useTenantName } from '@/common/hooks/useTenantName';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';

export default function PublicPage() {
  const navigate = useNavigate();
  const tenantName = useTenantName();

  const [checkingAccessToken, setCheckingAccessToken] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem(LocalStorageKey.ACCESS_TOKEN);

    if (accessToken !== null) {
      navigate(`/${tenantName}`);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCheckingAccessToken(false);
    }
  }, [navigate, tenantName]);
  return !checkingAccessToken && <Outlet />;
}
