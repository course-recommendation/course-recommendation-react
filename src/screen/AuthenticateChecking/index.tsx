import { LocalStorageKey } from '@/common/constants/LocalStorageKey';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';

export default function AuthenticateChecking() {
  const navigate = useNavigate();

  const user = localStorage.getItem(LocalStorageKey.ACCESS_TOKEN);

  useEffect(() => {
    if (user === null) {
      navigate('/public-path/login');
    }
  }, [navigate, user]);

  return user !== null && <Outlet />;
}
