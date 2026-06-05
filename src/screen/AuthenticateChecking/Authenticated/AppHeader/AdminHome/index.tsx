import { AttributesSection } from './AttributesSection';
import { CoursesSection } from './CoursesSection';
import { RatingsSection } from './RatingsSection';
import { RetrainSection } from './RetrainSection';
import { UsersSection } from './UsersSection';

export default function AdminHome() {
  return (
    <div className='space-y-8 p-4'>
      <h2 className='text-2xl font-bold'>Trang quản trị</h2>
      <UsersSection />
      <AttributesSection />
      <CoursesSection />
      <RatingsSection />
      <RetrainSection />
    </div>
  );
}
