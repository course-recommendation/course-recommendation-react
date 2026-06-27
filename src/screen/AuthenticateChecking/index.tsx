import { LocalStorageKey } from '@/common/constants/LocalStorageKey';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Spin } from 'antd';
import defaultAxios from '@/common/services/defaultAxios';

export default function AuthenticateChecking() {
  const navigate = useNavigate();

  const user = localStorage.getItem(LocalStorageKey.ACCESS_TOKEN);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  useEffect(() => {
    if (user === null) {
      const destination = window.location.pathname + window.location.search;
      const loginPath =
        destination !== '/' && destination !== '/public-path/login'
          ? `/public-path/login?redirect=${encodeURIComponent(destination)}`
          : '/public-path/login';
      navigate(loginPath);
      return;
    }

    // Check if user is admin and redirect early to avoid flicker
    const checkAdmin = async () => {
      setCheckingAdmin(true);
      try {
        const resp = await defaultAxios.get('/admin/is-admin');
        const isAdmin = resp.data.data as boolean;
        if (isAdmin) {
          navigate('/admin', { replace: true });
        }
      } catch (_e) {
        // ignore
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, [navigate, user]);

  // while checking admin, show spinner to avoid flicker
  if (user === null) return null;

  if (checkingAdmin) return <Spin fullscreen />;

  return <Outlet />;
}
