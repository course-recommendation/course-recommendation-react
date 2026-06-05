import useGet from '@/common/hooks/network/useGet';
import { Algorithm } from '@/common/types/Course.types';
import { FindPostDetailsRequest, PostDetail } from '@/common/types/Discuss.types';
import { FilterOutlined } from '@ant-design/icons';
import { Button, Drawer } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import DiscussFilter from './components/DiscussFilter';
import DiscussMainArea from './DiscussMainArea';
import DiscussRightSidebar from './DiscussRightSidebar';

type Props = {
  algorithm: Algorithm;
};

export default function Discuss({ algorithm }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filteredCourseCodes, setFilteredCourseCodes] = useState<string[]>([]);
  const [finalFilteredCourseCodes, setFinalFilteredCourseCodes] = useState<string[]>([]);
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);

  const {
    data: postDetailsResponse,
    isPending: postDetailsPending,
    refetch: refetchPosts,
  } = useGet<PostDetail[]>(`/posts`, {
    params: {
      sort: ['createdAt,desc'],
      algorithm,
      courseIdsRequest: {
        fetchAll: finalFilteredCourseCodes.length === 0,
        data: finalFilteredCourseCodes,
      },
    } as FindPostDetailsRequest,
  });

  const topCourses = useMemo(() => {
    if (!postDetailsResponse) return [];
    const courseCounts = new Map<
      string,
      { course: (typeof postDetailsResponse.data)[0]['course']; count: number }
    >();
    postDetailsResponse.data.forEach(({ course }) => {
      const existing = courseCounts.get(course.code);
      if (existing) {
        existing.count++;
      } else {
        courseCounts.set(course.code, { course, count: 1 });
      }
    });
    return [...courseCounts.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  }, [postDetailsResponse]);

  const resolveNumberOfFiltersText = () => {
    const filterCount = finalFilteredCourseCodes.length;
    if (filterCount === 0) return '';
    return ` (${filterCount})`;
  };

  useEffect(() => {
    const courseCodesParam = searchParams.get('courseCodes');
    if (courseCodesParam) {
      const codes = courseCodesParam.split(',');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilteredCourseCodes(codes);
      setFinalFilteredCourseCodes(codes);
    }
  }, [searchParams]);

  useEffect(() => {
    if (finalFilteredCourseCodes.length > 0) {
      setSearchParams({ courseCodes: finalFilteredCourseCodes.join(',') }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [finalFilteredCourseCodes, setSearchParams]);

  return (
    <div className='grid grid-cols-1 items-start gap-5 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr_260px] md:gap-6 lg:gap-8'>
      {/* Left filter sidebar */}
      <div className='hidden md:block'>
        <DiscussFilter
          algorithm={algorithm}
          selectedCourseIds={filteredCourseCodes}
          onSelectedCourseIdsChange={(courseIds) => {
            setFilteredCourseCodes(courseIds);
            setFinalFilteredCourseCodes(courseIds);
          }}
        />
      </div>

      {/* Main feed */}
      <div className='min-w-0'>
        <DiscussMainArea
          algorithm={algorithm}
          postDetails={postDetailsResponse?.data}
          postDetailsPending={postDetailsPending}
          refetchPosts={refetchPosts}
          filterSection={
            <Button
              type='primary'
              className='md:hidden rounded-xl'
              icon={<FilterOutlined />}
              size='large'
              onClick={() => setOpenFilterDrawer(true)}
            >
              {`Bộ lọc${resolveNumberOfFiltersText()}`}
            </Button>
          }
        />
      </div>

      {/* Right sidebar */}
      <div className='hidden lg:block'>
        <DiscussRightSidebar topCourses={topCourses} />
      </div>

      {/* Mobile filter drawer */}
      <Drawer
        open={openFilterDrawer}
        onClose={() => {
          setOpenFilterDrawer(false);
          setFilteredCourseCodes(finalFilteredCourseCodes);
        }}
        placement='bottom'
        size='large'
        className='md:hidden'
        styles={{ body: { background: '#f9fafb', paddingTop: 12 } }}
        title='Bộ lọc thảo luận'
        extra={
          <Button
            type='primary'
            onClick={() => {
              setFinalFilteredCourseCodes(filteredCourseCodes);
              setOpenFilterDrawer(false);
            }}
          >
            Áp dụng
          </Button>
        }
      >
        <DiscussFilter
          algorithm={algorithm}
          selectedCourseIds={filteredCourseCodes}
          onSelectedCourseIdsChange={(courseIds) => {
            setFilteredCourseCodes(courseIds);
          }}
        />
      </Drawer>
    </div>
  );
}
