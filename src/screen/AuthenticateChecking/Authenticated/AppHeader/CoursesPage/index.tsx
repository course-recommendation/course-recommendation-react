import { useGetCourseDetails } from '@/api/course.api';
import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import { CloseCircleFilled, SearchOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import CourseList from './CourseList';

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const algorithm = useAlgorithmContext();
  const initialKeyword = searchParams.get('keyword') ?? '';

  const [courseNameKeyword, setCourseNameKeyword] = useState(initialKeyword);
  const [requestCourseName, setRequestCourseName] = useState(initialKeyword);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRequestCourseName(courseNameKeyword);
      if (courseNameKeyword.trim()) {
        setSearchParams({ keyword: courseNameKeyword }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [courseNameKeyword, setSearchParams]);

  const { data: courseDetailsResponse, isPending: courseDetailsPending } = useGetCourseDetails({
    algorithm,
    name: requestCourseName,
  });

  return (
    <div>
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8'>
        {/*<div>*/}
        {/*  <h1*/}
        {/*    className='text-[28px] font-semibold text-[#1C1917] leading-tight'*/}
        {/*    style={{ fontFamily: 'var(--font-serif)' }}*/}
        {/*  >*/}
        {/*    Môn học*/}
        {/*  </h1>*/}
        {/*  <div className='mt-2 w-8 h-[3px] rounded-full bg-indigo-700' />*/}
        {/*</div>*/}

        {/* Search bar */}
        <div
          className={[
            'relative flex items-center w-full md:w-80',
            'rounded-xl border bg-white transition-all duration-200',
            isFocused
              ? 'border-indigo-400 shadow-[0_0_0_3px_rgba(99,102,241,0.12),0_2px_8px_rgba(67,56,202,0.10)]'
              : 'border-[#E8E5E0] shadow-[0_1px_4px_rgba(0,0,0,0.06)]',
          ].join(' ')}
        >
          <SearchOutlined
            className={[
              'absolute left-3.5 text-base transition-colors duration-200',
              isFocused ? 'text-primary' : 'text-gray-400',
            ].join(' ')}
          />
          <input
            ref={inputRef}
            type='text'
            placeholder='Tìm kiếm môn học...'
            value={courseNameKeyword}
            onChange={(e) => setCourseNameKeyword(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={[
              'w-full bg-transparent py-2.5 pl-9 text-sm text-[#1C1917] outline-none',
              'placeholder:text-gray-400',
              courseNameKeyword ? 'pr-9' : 'pr-4',
            ].join(' ')}
            style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}
          />

          {courseNameKeyword && (
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                setCourseNameKeyword('');
                inputRef.current?.focus();
              }}
              className='absolute right-3 flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors duration-150'
              aria-label='Clear search'
            >
              <CloseCircleFilled className='text-sm' />
            </button>
          )}
        </div>
      </div>

      <CourseList courseDetails={courseDetailsResponse?.data} loading={courseDetailsPending} />
    </div>
  );
}
