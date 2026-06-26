import { SettingOutlined } from '@ant-design/icons';
import { AttributesSection } from './AttributesSection';
import { CoursesSection } from './CoursesSection';
import { RatingsSection } from './RatingsSection';
import { RetrainSection } from './RetrainSection';
import { UsersSection } from './UsersSection';

export default function AdminHome() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='border-b border-gray-200 bg-white px-8 py-6 shadow-sm'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600'>
            <SettingOutlined className='text-base text-white' />
          </div>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>Trang quản trị</h1>
            <p className='text-sm text-gray-500'>Quản lý người dùng, khóa học và hệ thống gợi ý</p>
          </div>
        </div>
      </div>
      <div className='space-y-6 p-8'>
        <CoursesSection />
        <AttributesSection />
        <UsersSection />
        <RatingsSection />
        <RetrainSection />
      </div>
    </div>
  );
}
