import { useGetCourseDetails } from '@/api/course.api';
import { useCourseDomainContext } from '@/common/context/DomainContext';
import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { useState } from 'react';
import CourseList from './CourseList';

export default function CoursesPage() {
  const domain = useCourseDomainContext();
  const [requestCourseName, setRequestCourseName] = useState('');

  const { data: courseDetailsResponse } = useGetCourseDetails({
    domain,
    name: requestCourseName,
  });

  return (
    <div>
      <div className='flex justify-between'>
        <div className='text-3xl font-bold'>Môn học</div>
        <Input
          className='w-[300px]'
          placeholder='Tìm kiếm môn học...'
          size='large'
          prefix={<SearchOutlined />}
          onPressEnter={(e) => {
            setRequestCourseName(e.currentTarget.value);
          }}
        />
      </div>

      <div className='my-5'></div>

      <CourseList courseDetails={courseDetailsResponse?.data ?? []} />
    </div>
  );
}
