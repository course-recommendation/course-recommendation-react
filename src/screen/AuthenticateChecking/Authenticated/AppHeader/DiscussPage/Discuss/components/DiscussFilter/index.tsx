import useGet from '@/common/hooks/network/useGet';
import { Algorithm, Course, GetCoursesRequest } from '@/common/types/Course.types';
import { SearchOutlined } from '@ant-design/icons';
import { Card, Checkbox, Collapse, Input, Skeleton, Tag, Typography } from 'antd';
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
    params: {
      algorithm,
    } as GetCoursesRequest,
  });
  const [input, setInput] = useState('');

  const filteredCourses = useMemo(() => {
    return (
      allCoursesResponse?.data.filter((course) => {
        return course.name.toLowerCase().includes(input);
      }) ?? []
    );
  }, [allCoursesResponse?.data, input]);

  const checkedCourses =
    allCoursesResponse?.data.filter((course) => {
      return selectedCourseIds.includes(course.code);
    }) ?? [];

  return (
    <Card
      className='h-full overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur'
      styles={{ body: { paddingTop: 14 } }}
      title={
        <div className='flex items-center gap-2 md:gap-3'>
          <Typography.Title level={4} className='!mb-0 !text-slate-800'>
            Bộ lọc
          </Typography.Title>
          <Typography.Text className='text-xs !text-slate-500'>
            {`Đã chọn ${selectedCourseIds.length} môn`}
          </Typography.Text>
        </div>
      }
      extra={
        <Typography.Text
          className='cursor-pointer text-slate-500 hover:!text-indigo-600'
          underline
          onClick={() => {
            onSelectedCourseIdsChange([]);
          }}
        >
          Xóa bộ lọc
        </Typography.Text>
      }
    >
      {(() => {
        if (allCoursesPending) {
          return <Skeleton />;
        }

        return (
          <div>
            <div className='flex flex-wrap gap-2'>
              {checkedCourses.map((course) => {
                return (
                  <Tag
                    closeIcon
                    key={course.id}
                    onClose={() => {
                      onSelectedCourseIdsChange(selectedCourseIds.filter((x) => x !== course.code));
                    }}
                    className='rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm text-indigo-700'
                  >
                    {course.name}
                  </Tag>
                );
              })}
            </div>
            <div className='my-4' />
            <Collapse
              defaultActiveKey={['courses']}
              ghost
              items={[
                {
                  key: 'courses',
                  label: (
                    <Typography.Title level={5} className='m-0 !text-slate-700'>
                      Môn học
                    </Typography.Title>
                  ),
                  children: (
                    <div>
                      <Input
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                        }}
                        allowClear
                        prefix={<SearchOutlined className='text-slate-400' />}
                        placeholder='Tìm môn học'
                      />
                      <div className='my-3' />
                      <div className='h-[300px] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2'>
                        <Checkbox.Group
                          className='flex flex-col gap-1'
                          options={filteredCourses.map((course) => {
                            return {
                              label: course.name,
                              value: course.code,
                            };
                          })}
                          value={selectedCourseIds}
                          onChange={(e) => {
                            onSelectedCourseIdsChange(e);
                          }}
                        />
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        );
      })()}
    </Card>
  );
}
