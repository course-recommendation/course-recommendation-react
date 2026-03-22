import { LocalStorageKey } from '@/common/constants/LocalStorageKey';
import { useCourseDomainContext } from '@/common/context/DomainContext';
import { Algorithm, Dataset } from '@/common/types/Course.types';
import { MenuOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Layout,
  Menu,
  MenuProps,
  Select,
  Typography,
} from 'antd';
import { Header } from 'antd/es/layout/layout';
import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { useMeContext } from '../context/MeContext';

const PathKey = {
  RECOMMENDATION: 'RECOMMENDATION',
  DISCUSS: 'DISCUSS',
  MY_COURSES: 'MY_COURSES',
};

export default function AppHeader() {
  const { pathname } = useLocation();
  const { me } = useMeContext();
  const { algorithm, dataset } = useCourseDomainContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDiscussPage = pathname.includes('/discuss');
  const isMyCoursesPage = pathname.includes('/my-courses');

  const headerMenuItems: MenuProps['items'] = [
    {
      key: PathKey.RECOMMENDATION,
      label: <Link to={'/'}>Gợi ý môn học</Link>,
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
    return PathKey.RECOMMENDATION;
  })();

  const handleMenuClick = () => {
    setMobileMenuOpen(false);
  };

  const algorithmSelect = (
    <Select
      className='w-full md:w-auto'
      options={[
        {
          label: 'Feature Sentiment',
          value: Algorithm.FS,
        },
        {
          label: 'TriRank',
          value: Algorithm.TRI_RANK,
        },
      ]}
      onSelect={(value) => {
        localStorage.setItem(LocalStorageKey.ALGORITHM, value);
        window.location.reload();
      }}
      defaultValue={algorithm}
    />
  );

  const datasetSelect = (
    <Select
      className='w-full md:w-auto'
      options={[
        { label: 'HCMUS', value: Dataset.FIT },
        { label: 'Cellphone', value: Dataset.CELLPHONE },
      ]}
      onSelect={(value) => {
        localStorage.setItem(LocalStorageKey.DATASET, value);
        window.location.reload();
      }}
      defaultValue={dataset}
    />
  );

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
      <Avatar className='hover:cursor-pointer' src={me.avatarUrl} size={30} />
    </Dropdown>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className='bg-white shadow z-10 sticky top-0 px-4 md:px-6'>
        <div className='flex items-center justify-between h-full'>
          <div className='flex items-center flex-1'>
            <Button
              className='md:hidden'
              type='text'
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
            />
            <div className='mx-1'></div>
            <Typography.Title level={4} className='my-0 text-xl whitespace-nowrap'>
              <Link to={'/'} className='text-black'>
                App Name
              </Link>
            </Typography.Title>

            <div className='hidden md:flex ml-8'>
              <div className='w-[400px]'>
                <Menu mode='horizontal' items={headerMenuItems} selectedKeys={[selectedKey]} />
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2 md:gap-3'>
            <div className='hidden md:flex items-center gap-3'>
              {algorithmSelect}
              {datasetSelect}
              {userDropdown}
            </div>

            <div className='md:hidden'>{userDropdown}</div>
          </div>
        </div>

        <Drawer
          title='Menu'
          placement='left'
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
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
                  Thuật toán
                </Typography.Text>
                {algorithmSelect}
              </div>
              <div>
                <Typography.Text className='text-xs text-gray-500 mb-1 block'>
                  Dữ liệu
                </Typography.Text>
                {datasetSelect}
              </div>
            </div>
          </div>
        </Drawer>
      </Header>

      <Outlet />
    </Layout>
  );
}
