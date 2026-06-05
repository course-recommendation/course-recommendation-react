import useGet from '@/common/hooks/network/useGet';
import { Algorithm, Course, GetCoursesRequest } from '@/common/types/Course.types';
import { CloseOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Input, Skeleton, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';

type Props = {
  algorithm: Algorithm;
  selectedCourseIds: string[];
  onSelectedCourseIdsChange: (courseIds: string[]) => void;
};

export default function DiscussFilter({
  algorithm,
  selectedCourseIds,
  onSelectedCourseIdsChange,
}: Props) {
  const { data: allCoursesResponse, isPending: allCoursesPending } = useGet<Course[]>('/courses', {
    params: { algorithm } as GetCoursesRequest,
  });
  const [input, setInput] = useState('');

  const allCourses = allCoursesResponse?.data ?? [];

  const selectedCourses = useMemo(
    () => allCourses.filter((c) => selectedCourseIds.includes(c.code)),
    [allCourses, selectedCourseIds],
  );

  const filteredCourses = useMemo(
    () => allCourses.filter((c) => c.name.toLowerCase().includes(input.toLowerCase())),
    [allCourses, input],
  );

  const toggleCourse = (code: string) => {
    if (selectedCourseIds.includes(code)) {
      onSelectedCourseIdsChange(selectedCourseIds.filter((x) => x !== code));
    } else {
      onSelectedCourseIdsChange([...selectedCourseIds, code]);
    }
  };

  const removeSelected = (code: string) => {
    onSelectedCourseIdsChange(selectedCourseIds.filter((x) => x !== code));
  };

  return (
    <div className='sticky top-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-100'>
      {/* Header */}
      <div className='flex items-center gap-2 px-4 py-3.5 bg-indigo-50 border-b border-indigo-100'>
        <FilterOutlined className='text-indigo-500 text-sm' />
        <Typography.Text strong className='text-slate-800 text-sm flex-1'>
          Bộ lọc môn học
        </Typography.Text>
        {selectedCourseIds.length > 0 && (
          <button
            onClick={() => onSelectedCourseIdsChange([])}
            className='text-xs text-slate-400 hover:text-red-500 transition-colors font-medium'
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Selected tags strip */}
      {selectedCourses.length > 0 && (
        <div className='px-3 py-2.5 border-b border-slate-100 bg-indigo-50/40'>
          <p className='text-[10px] font-semibold uppercase tracking-wider text-indigo-400 mb-1.5'>
            Đang lọc ({selectedCourses.length})
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {selectedCourses.map((course) => (
              <Tag
                key={course.code}
                closable
                onClose={() => removeSelected(course.code)}
                closeIcon={<CloseOutlined className='text-[10px]' />}
                className='rounded-full border-indigo-200 bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 flex items-center gap-1 m-0'
              >
                {course.name}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className='px-3 py-2 border-b border-slate-100'>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          allowClear
          prefix={<SearchOutlined className='text-slate-400 text-xs' />}
          placeholder='Tìm môn học...'
          variant='borderless'
          className='bg-slate-50 rounded-lg text-sm'
          size='small'
        />
      </div>

      {/* Course list */}
      <div className='max-h-[360px] overflow-y-auto py-1'>
        {allCoursesPending ? (
          <div className='px-4 py-3'>
            <Skeleton active paragraph={{ rows: 5 }} title={false} />
          </div>
        ) : filteredCourses.length === 0 ? (
          <p className='px-4 py-3 text-sm text-slate-400'>Không tìm thấy môn học</p>
        ) : (
          filteredCourses.map((course) => {
            const isSelected = selectedCourseIds.includes(course.code);
            return (
              <button
                key={course.id}
                onClick={() => toggleCourse(course.code)}
                className={`w-full text-left px-4 py-2 text-sm transition-all border-l-[3px] flex items-center justify-between group ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/80 text-indigo-700 font-medium'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800'
                }`}
              >
                <span className='leading-snug'>{course.name}</span>
                {isSelected && (
                  <CloseOutlined className='text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2' />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
