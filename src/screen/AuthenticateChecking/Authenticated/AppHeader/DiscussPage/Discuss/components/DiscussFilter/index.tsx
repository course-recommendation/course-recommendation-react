import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import { Algorithm, Course, GetCoursesRequest } from '@/common/types/Course.types';
import { User } from '@/common/types/User.types';
import { CloseOutlined, FilterOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Input, Skeleton, Spin, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';

type Props = {
  algorithm: Algorithm;
  selectedCourseIds: string[];
  onSelectedCourseIdsChange: (courseIds: string[]) => void;
  selectedAuthorIds: string[];
  onSelectedAuthorIdsChange: (authorIds: string[]) => void;
  authorUsersMap: Record<string, User>;
  onAuthorUsersCacheUpdate: (user: User) => void;
};

export default function DiscussFilter({
  algorithm,
  selectedCourseIds,
  onSelectedCourseIdsChange,
  selectedAuthorIds,
  onSelectedAuthorIdsChange,
  authorUsersMap,
  onAuthorUsersCacheUpdate,
}: Props) {
  const { data: allCoursesResponse, isPending: allCoursesPending } = useGet<Course[]>('/courses', {
    params: { algorithm } as GetCoursesRequest,
  });
  const [courseInput, setCourseInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [authorSearchResults, setAuthorSearchResults] = useState<User[]>([]);
  const [authorSearchPending, setAuthorSearchPending] = useState(false);

  const { request: searchUsersRequest } = useRequest<User[]>();

  const allCourses = useMemo(() => allCoursesResponse?.data ?? [], [allCoursesResponse?.data]);

  const selectedCourses = useMemo(
    () => allCourses.filter((c) => selectedCourseIds.includes(c.code)),
    [allCourses, selectedCourseIds],
  );

  const filteredCourses = useMemo(
    () => allCourses.filter((c) => c.name.toLowerCase().includes(courseInput.toLowerCase())),
    [allCourses, courseInput],
  );

  const toggleCourse = (code: string) => {
    if (selectedCourseIds.includes(code)) {
      onSelectedCourseIdsChange(selectedCourseIds.filter((x) => x !== code));
    } else {
      onSelectedCourseIdsChange([...selectedCourseIds, code]);
    }
  };

  const toggleAuthor = (user: User) => {
    onAuthorUsersCacheUpdate(user);
    if (selectedAuthorIds.includes(user.id)) {
      onSelectedAuthorIdsChange(selectedAuthorIds.filter((x) => x !== user.id));
    } else {
      onSelectedAuthorIdsChange([...selectedAuthorIds, user.id]);
    }
  };

  const handleAuthorSearch = async (value: string) => {
    setAuthorInput(value);
    if (!value.trim()) {
      setAuthorSearchResults([]);
      return;
    }
    setAuthorSearchPending(true);
    try {
      const response = await searchUsersRequest({
        url: '/users',
        params: { search: value },
      });
      setAuthorSearchResults(response?.data ?? []);
    } catch {
      setAuthorSearchResults([]);
    } finally {
      setAuthorSearchPending(false);
    }
  };

  const totalFilters = selectedCourseIds.length + selectedAuthorIds.length;

  const clearAll = () => {
    onSelectedCourseIdsChange([]);
    onSelectedAuthorIdsChange([]);
  };

  return (
    <div className='sticky top-0 overflow-hidden rounded-xl border border-[#E8E5E0] bg-white shadow-sm'>
      {/* Header */}
      <div className='flex items-center gap-2 px-4 py-3.5 border-b border-[#E8E5E0]'>
        <FilterOutlined className='text-primary text-lg' />
        <Typography.Text strong className='text-[#1C1917] flex-1 text-base'>
          Bộ lọc bài viết
        </Typography.Text>
        {totalFilters > 0 && (
          <button
            onClick={clearAll}
            className='text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium'
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Course section */}
      <div className='border-b border-[#E8E5E0]'>
        <p className='px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
          Môn học
        </p>
        {selectedCourses.length > 0 && (
          <div className='px-3 pb-2 flex flex-wrap gap-1.5'>
            {selectedCourses.map((course) => (
              <Tag
                key={course.code}
                closable
                onClose={() =>
                  onSelectedCourseIdsChange(selectedCourseIds.filter((x) => x !== course.code))
                }
                closeIcon={<CloseOutlined className='text-[10px]' />}
                className='rounded-full border-indigo-100 bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 flex items-center gap-1 m-0'
              >
                {course.name}
              </Tag>
            ))}
          </div>
        )}
        <div className='px-3 pb-2'>
          <Input
            value={courseInput}
            onChange={(e) => setCourseInput(e.target.value)}
            allowClear
            prefix={<SearchOutlined />}
            placeholder='Tìm môn học...'
            size='small'
          />
        </div>
        <div className='max-h-[220px] overflow-y-auto py-1'>
          {(() => {
            if (allCoursesPending) {
              return (
                <div className='px-4 py-3'>
                  <Skeleton active paragraph={{ rows: 4 }} title={false} />
                </div>
              );
            }
            if (filteredCourses.length === 0) {
              return <p className='px-4 py-3 text-sm text-slate-400'>Không tìm thấy môn học</p>;
            }
            return filteredCourses.map((course) => {
              const isSelected = selectedCourseIds.includes(course.code);
              return (
                <button
                  key={course.id}
                  onClick={() => toggleCourse(course.code)}
                  className={`w-full text-left px-4 py-2 text-sm transition-all border-l-[3px] flex items-center justify-between group ${
                    isSelected
                      ? 'border-primary bg-indigo-50 text-indigo-700 font-medium'
                      : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-[#E8E5E0] hover:text-slate-800'
                  }`}
                >
                  <span className='leading-snug'>{course.name}</span>
                  {isSelected && (
                    <CloseOutlined className='text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2' />
                  )}
                </button>
              );
            });
          })()}
        </div>
      </div>

      {/* Author section */}
      <div>
        <p className='px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5'>
          <UserOutlined />
          Tác giả
        </p>
        {selectedAuthorIds.length > 0 && (
          <div className='px-3 pb-2 flex flex-wrap gap-1.5'>
            {selectedAuthorIds.map((id) => {
              const user = authorUsersMap[id];
              return (
                <Tag
                  key={id}
                  closable
                  onClose={() =>
                    onSelectedAuthorIdsChange(selectedAuthorIds.filter((x) => x !== id))
                  }
                  closeIcon={<CloseOutlined className='text-[10px]' />}
                  className='rounded-full border-indigo-100 bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 flex items-center gap-1 m-0'
                >
                  {user ? user.fullName : id}
                </Tag>
              );
            })}
          </div>
        )}
        <div className='px-3 pb-2'>
          <Input
            value={authorInput}
            onChange={(e) => handleAuthorSearch(e.target.value)}
            allowClear
            onClear={() => setAuthorSearchResults([])}
            prefix={<SearchOutlined />}
            placeholder='Tìm tác giả...'
            size='small'
          />
        </div>
        <div className='max-h-[180px] overflow-y-auto py-1'>
          {(() => {
            if (authorSearchPending) {
              return (
                <div className='flex justify-center py-3'>
                  <Spin size='small' />
                </div>
              );
            }
            if (authorInput && authorSearchResults.length === 0) {
              return <p className='px-4 py-3 text-sm text-slate-400'>Không tìm thấy tác giả</p>;
            }
            if (authorSearchResults.length > 0) {
              return authorSearchResults.map((user) => {
                const isSelected = selectedAuthorIds.includes(user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => toggleAuthor(user)}
                    className={`w-full text-left px-3 py-2 text-sm transition-all border-l-[3px] flex items-center gap-2.5 group ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                        : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-[#E8E5E0] hover:text-slate-800'
                    }`}
                  >
                    <Avatar src={user.avatarUrl} size={24} className='shrink-0' />
                    <span className='leading-snug flex-1 truncate'>{user.fullName}</span>
                    {isSelected && (
                      <CloseOutlined className='text-[10px] text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0' />
                    )}
                  </button>
                );
              });
            }
            return (
              <p className='px-4 py-2 pb-3 text-xs text-slate-400'>Nhập tên để tìm kiếm tác giả</p>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
