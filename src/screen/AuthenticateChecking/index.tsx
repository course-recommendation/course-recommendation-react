import { LocalStorageKey } from '@/common/constants/LocalStorageKey';
import { useTenantName } from '@/common/hooks/useTenantName';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';

export default function AuthenticateChecking() {
  const navigate = useNavigate();
  const tenantName = useTenantName();

  const user = localStorage.getItem(LocalStorageKey.ACCESS_TOKEN);

  useEffect(() => {
    if (user === null) {
      navigate(`/${tenantName}/public-path/login`);
    }
  }, [navigate, tenantName, user]);

  return user !== null && <Outlet />;
}
