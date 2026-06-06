import BookIcon from '@/assets/icons/BookIcon';
import { LocalStorageKey } from '@/common/constants/LocalStorageKey';
import useGet from '@/common/hooks/network/useGet';
import { MenuOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Layout,
  Menu,
  MenuProps,
  Result,
  Typography,
} from 'antd';
import { Header } from 'antd/es/layout/layout';
import { useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router';
import { useMeContext } from '../context/MeContext';

const PathKey = {
  RECOMMENDATION: 'RECOMMENDATION',
  DISCUSS: 'DISCUSS',
  MY_COURSES: 'MY_COURSES',
  COURSES: 'COURSES',
  ADMIN: 'ADMIN',
};

export default function AppHeader() {
  const { pathname } = useLocation();
  const { me, isFirstLogin, isAdmin } = useMeContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDoingSurvey = isFirstLogin || pathname === '/survey';

  const { data: tenantReadyResponse } = useGet<boolean>('/admin/tenant-ready');
  const tenantReady = tenantReadyResponse?.data;

  const isDiscussPage = pathname.includes('/discuss');
  const isMyCoursesPage = pathname.includes('/my-courses');
  const isCoursesPage = pathname.includes('/courses');
  const isAdminPage = pathname.includes('/admin');

  // If admin and on root path, redirect to /admin immediately to avoid flicker
  if (isAdmin && pathname === '/') {
    return <Navigate to={'/admin'} replace />;
  }

  const headerMenuItems: MenuProps['items'] = isAdmin
    ? [
        {
          key: PathKey.ADMIN,
          label: <Link to={'/admin'}>Trang chủ</Link>,
        },
      ]
    : [
        {
          key: PathKey.RECOMMENDATION,
          label: <Link to={'/'}>Gợi ý môn học</Link>,
        },
        {
          key: PathKey.COURSES,
          label: <Link to={'/courses'}>Môn học</Link>,
        },
        {
          key: PathKey.DISCUSS,
          label: <Link to={'/discuss'}>Thảo luận</Link>,
        },
        {
          key: PathKey.MY_COURSES,
          label: <Link to={'/my-courses'}>Môn học của tôi</Link>,
        },
      ];

  const selectedKey = (() => {
    if (isDiscussPage) {
      return PathKey.DISCUSS;
    }
    if (isMyCoursesPage) {
      return PathKey.MY_COURSES;
    }
    if (isCoursesPage) {
      return PathKey.COURSES;
    }
    if (isAdminPage) {
      return PathKey.ADMIN;
    }
    return PathKey.RECOMMENDATION;
  })();

  const handleMenuClick = () => {
    setMobileMenuOpen(false);
  };

  const userDropdown = (
    <Dropdown
      placement='bottomRight'
      trigger={['click']}
      menu={{
        items: [
          {
            key: 'logout',
            label: (
              <a
                onClick={() => {
                  localStorage.removeItem(LocalStorageKey.ACCESS_TOKEN);
                  window.location.reload();
                }}
              >
                Đăng xuất
              </a>
            ),
          },
        ],
      }}
    >
      <Avatar className='hover:cursor-pointer' src={me.avatarUrl} size={36} />
    </Dropdown>
  );

  return (
    <Layout style={{ height: '100vh' }}>
      <Header
        className='bg-[#FAF9F7] border-b border-stone-200 z-10 sticky top-0 px-4 md:px-20'
        style={{ boxShadow: 'none' }}
      >
        <div className='flex items-center justify-between h-full'>
          <div className='flex items-center'>
            <Button
              className='md:hidden'
              type='text'
              icon={<MenuOutlined />}
              hidden={isDoingSurvey}
              onClick={() => setMobileMenuOpen(true)}
            />
            <div className='mx-1'></div>
            <Link to={'/'} className='text-black'>
              <span className='flex items-center gap-2'>
                <BookIcon className='text-primary inline w-8 h-8 md:w-10 md:h-10' />
                <span className='font-bold text-xl md:text-2xl'>CourseHub</span>
              </span>
            </Link>
            {!isDoingSurvey && (
              <div className='hidden md:flex ml-8'>
                <Menu
                  mode='horizontal'
                  items={headerMenuItems}
                  selectedKeys={[selectedKey]}
                  style={{ background: 'transparent' }}
                  disabledOverflow
                />
              </div>
            )}
          </div>

          <div className='flex items-center gap-2 md:gap-3'>
            <div className='hidden md:flex items-center gap-3'>{userDropdown}</div>

            <div className='md:hidden'>{userDropdown}</div>
          </div>
        </div>

        <Drawer
          title='Menu'
          placement='left'
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen && !isDoingSurvey}
          size={280}
        >
          <div className='flex flex-col gap-4'>
            <Menu
              mode='vertical'
              items={headerMenuItems}
              selectedKeys={[selectedKey]}
              onClick={handleMenuClick}
            />

            <div className='border-t my-2' />

            <div className='flex flex-col gap-3'>
              <div>
                <Typography.Text className='text-xs text-gray-500 mb-1 block'>
                  Dữ liệu
                </Typography.Text>
              </div>
            </div>
          </div>
        </Drawer>
      </Header>

      <div className='flex-1 min-h-0 overflow-auto overscroll-y-none px-4 py-6 md:px-20 md:py-10'>
        {!isAdmin && tenantReady === false ? (
          <Result
            status='warning'
            title='Dữ liệu chưa sẵn sàng cho hệ thống này này'
            subTitle='Vui lòng chờ quản trị viên cập nhật hệ thống'
          />
        ) : (
          <Outlet />
        )}
      </div>
    </Layout>
  );
}
