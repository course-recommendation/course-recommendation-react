import CourseStatusButton from '@/common/components/CourseStatusButton';
import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import { useAttributeValues } from '@/common/hooks/useAttributeValues';
import {
  CourseDetail,
  GetCourseDetailsRequest,
  RateCourseRequest,
  UserCourseStatus,
} from '@/common/types/Course.types';
import { Card, Divider, Skeleton } from 'antd';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import AttributeRating from './AttributeRating';

export default function CourseDetailPage() {
  const { courseCode: courseCodeOpt } = useParams();
  const algorithm = useAlgorithmContext();

  const courseCode = courseCodeOpt!;

  const { data: courseDetailResponse, isPending: courseDetailPending } = useGet<CourseDetail>(
    `/courses/${courseCode}/detail`,
    {
      params: { algorithm } as GetCourseDetailsRequest,
    },
  );

  const [userCourseStatusOverride, setUserCourseStatusOverride] = useState<
    UserCourseStatus | undefined
  >(undefined);
  const [isUserCourseStatusOverridden, setIsUserCourseStatusOverridden] = useState(false);

  const { data: attributeValuesResponse, isPending: attributeValuesPending } = useAttributeValues({
    algorithm,
  });

  const { request: rateCourse } = useRequest<void, RateCourseRequest>();

  return (
    <div>
      {(() => {
        if (courseDetailPending || attributeValuesPending) {
          return <Skeleton />;
        }

        const courseDetail = courseDetailResponse!.data;
        const course = courseDetail.course;
        const attributeValues = attributeValuesResponse!.data;
        const userCourseStatus = isUserCourseStatusOverridden
          ? userCourseStatusOverride
          : courseDetail.userCourseStatus;

        return (
          <div>
            <Link to={'/courses'} className='font-medium text-xl'>
              ← Quay về danh sách môn học
            </Link>
            <div className='my-8'></div>
            <Card
              variant={'borderless'}
              className='shadow overflow-hidden'
              styles={{ body: { padding: 0 } }}
            >
              <img src={course.thumbnailUrl} className='w-full object-cover h-[300px]' />
              <div className='py-5 px-10'>
                <div className='text-2xl font-bold'>{course.name}</div>
                <div className='my-3'></div>
                <div className='text-gray-600 whitespace-pre-line'>{course.description}</div>
                <div className='my-4'></div>
                <div className='flex gap-3'>
                  <CourseStatusButton
                    type='plan'
                    marked={userCourseStatus === UserCourseStatus.PLANNED}
                    onMarkChange={(marked) => {
                      setUserCourseStatusOverride(marked ? UserCourseStatus.PLANNED : undefined);
                      setIsUserCourseStatusOverridden(true);
                    }}
                    courseId={course.id}
                  />
                  <CourseStatusButton
                    type='complete'
                    marked={userCourseStatus === UserCourseStatus.COMPLETED}
                    onMarkChange={(marked) => {
                      setUserCourseStatusOverride(marked ? UserCourseStatus.COMPLETED : undefined);
                      setIsUserCourseStatusOverridden(true);
                    }}
                    courseId={course.id}
                  />
                </div>
                <Divider />
                <div className='rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 py-4'>
                  <div className='mt-2 text-2xl font-bold text-amber-900'>Đánh giá môn học</div>
                  <div className='mt-2 text-amber-900/80 font-medium'>
                    Chia sẻ cảm nhận của bạn để hệ thống gợi ý môn học chính xác hơn cho bạn và
                    những sinh viên khác.
                  </div>
                </div>
                <div className='my-5'></div>
                <div>
                  <AttributeRating
                    attributeValues={attributeValues}
                    attributeValueToRatingScore={courseDetail.userAttributeValueToRatingScore}
                    onRatingChange={async (attributeValue, score) => {
                      rateCourse({
                        method: 'PUT',
                        url: `/courses/${courseDetail.course.id}/rating`,
                        data: {
                          attributeValue,
                          score,
                        },
                      });
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>
        );
      })()}
    </div>
  );
}
