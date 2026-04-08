import { useGetCourseDetails } from '@/api/course.api';
import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import CourseList from './CourseList';

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const algorithm = useAlgorithmContext();
  const initialKeyword = searchParams.get('keyword') ?? '';

  const [courseNameKeyword, setCourseNameKeyword] = useState(initialKeyword);
  const [requestCourseName, setRequestCourseName] = useState(initialKeyword);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRequestCourseName(courseNameKeyword);
      if (courseNameKeyword.trim()) {
        setSearchParams({ keyword: courseNameKeyword }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [courseNameKeyword, setSearchParams]);

  const { data: courseDetailsResponse, isPending: courseDetailsPending } = useGetCourseDetails({
    algorithm,
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
          value={courseNameKeyword}
          onChange={(e) => {
            setCourseNameKeyword(e.currentTarget.value);
          }}
        />
      </div>

      <div className='my-5'></div>

      <CourseList courseDetails={courseDetailsResponse?.data} loading={courseDetailsPending} />
    </div>
  );
}
