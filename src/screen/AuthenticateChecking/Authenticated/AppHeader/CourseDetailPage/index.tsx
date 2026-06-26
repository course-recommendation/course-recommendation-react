import CourseStatusButton from '@/common/components/CourseStatusButton';
import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import { useAttributeValues } from '@/common/hooks/useAttributeValues';
import { useLogEvent } from '@/common/hooks/useLogEvent';
import {
  CourseDetail,
  GetCourseDetailsRequest,
  RateCourseRequest,
  UserCourseStatus,
} from '@/common/types/Course.types';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Skeleton } from 'antd';
import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import AttributeRating from './AttributeRating';

export default function CourseDetailPage() {
  const { courseCode: courseCodeOpt } = useParams();
  const [searchParams] = useSearchParams();
  const rank = searchParams.get('rank') ?? undefined;
  const algorithm = useAlgorithmContext();
  const logEvent = useLogEvent();

  const courseCode = courseCodeOpt!;

  const { data: courseDetailResponse, isPending: courseDetailPending } = useGet<CourseDetail>(
    `/courses/${courseCode}/detail`,
    { params: { algorithm } as GetCourseDetailsRequest },
  );

  const [userCourseStatusOverride, setUserCourseStatusOverride] = useState<
    UserCourseStatus | undefined
  >(undefined);
  const [isUserCourseStatusOverridden, setIsUserCourseStatusOverridden] = useState(false);

  const { data: attributeValuesResponse, isPending: attributeValuesPending } = useAttributeValues({
    algorithm,
  });

  const { request: rateCourse } = useRequest<void, RateCourseRequest>();

  if (courseDetailPending || attributeValuesPending) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  const courseDetail = courseDetailResponse!.data;
  const course = courseDetail.course;
  const attributes = attributeValuesResponse!.data;
  const userCourseStatus = isUserCourseStatusOverridden
    ? userCourseStatusOverride
    : courseDetail.userCourseStatus;

  return (
    <div className='max-w-4xl mx-auto'>
      {/* <Link
        to='/courses'
        className='inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-700 transition-colors font-medium'
      >
        ← Quay về danh sách môn học
      </Link> */}

      <div className='mt-6 flex flex-col gap-4'>
        {/* Hero image */}
        <div
          className='rounded-2xl overflow-hidden'
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)' }}
        >
          <img src={course.thumbnailUrl} className='w-full object-cover h-56 md:h-80' />
        </div>

        {/* Title + description card */}
        <div
          className='bg-white rounded-2xl border border-stone-200 px-7 py-6'
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.03)' }}
        >
          <h1 className='text-2xl md:text-3xl font-semibold text-[#1C1917] leading-snug'>
            {course.name}
          </h1>
          <p className='mt-3 text-gray-500 text-[15px] leading-[1.7] whitespace-pre-line'>
            {course.description}
          </p>
          <div className='mt-5 pt-4 border-t border-stone-100 flex flex-wrap gap-3 items-center justify-between'>
            <div className='flex flex-wrap gap-3'>
              <CourseStatusButton
                size='large'
                type='plan'
                marked={userCourseStatus === UserCourseStatus.PLANNED}
                onMarkChange={(marked) => {
                  if (marked) {
                    logEvent('click_planned', undefined, {
                      courseCode,
                      page: 'detail',
                      ...(rank != null && { rank }),
                    });
                  }
                  setUserCourseStatusOverride(marked ? UserCourseStatus.PLANNED : undefined);
                  setIsUserCourseStatusOverridden(true);
                }}
                courseId={course.id}
              />
              <CourseStatusButton
                size='large'
                type='complete'
                marked={userCourseStatus === UserCourseStatus.COMPLETED}
                onMarkChange={(marked) => {
                  setUserCourseStatusOverride(marked ? UserCourseStatus.COMPLETED : undefined);
                  setIsUserCourseStatusOverridden(true);
                }}
                courseId={course.id}
              />
            </div>
            <Link to={`/discuss?courseCodes=${courseCode}`}>
              <Button
                size='large'
                color='primary'
                variant='link'
                iconPlacement='end'
                icon={<ArrowRightOutlined />}
              >
                Xem thảo luận
              </Button>
            </Link>
          </div>
        </div>

        {/* Rating section */}
        <div
          className='bg-white rounded-2xl border border-stone-200 px-7 py-6'
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.03)' }}
        >
          <div className='mb-1'>
            <h2
              className='text-[24px] font-semibold text-[#1C1917] leading-tight'
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Đánh giá môn học
            </h2>
            <div className='mt-2 w-8 h-[3px] rounded-full bg-indigo-700' />
          </div>

          <p className='mt-4 text-gray-500 text-[15px] leading-[1.7]'>
            Chia sẻ cảm nhận của bạn để hệ thống gợi ý môn học chính xác hơn cho bạn và những sinh
            viên khác.
          </p>

          <div className='mt-6'>
            <AttributeRating
              attributes={attributes}
              attributeIdToRatingScore={courseDetail.userAttributeIdToRatingScore}
              onRatingChange={async (attributeId, score) => {
                rateCourse({
                  method: 'PUT',
                  url: `/courses/${courseDetail.course.id}/rating`,
                  data: { attributeId, score },
                });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
