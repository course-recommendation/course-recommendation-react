import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import {
  Algorithm,
  CourseDetail,
  GetCourseDetailsRequest,
  GetCoursesOfUserRequest,
  UpdateUserCourseStatusesRequest as UpdateUserCoursesRequest,
  UserCourseStatus,
} from '@/common/types/Course.types';
import MyCoursesSection from '@/screen/AuthenticateChecking/Authenticated/AppHeader/MyCoursesPage/components/MyCoursesSection';
import { BookOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useCallback } from 'react';

type Props = {
  algorithm: Algorithm;
};

export default function MyCourses({ algorithm }: Props) {
  const { data: allCourseDetailsResponse, isPending: allCourseDetailsPending } = useGet<
    CourseDetail[]
  >('/courses/detail', {
    params: {
      algorithm,
    } as GetCourseDetailsRequest,
  });

  const { request: updateUserCourses } = useRequest<void, UpdateUserCoursesRequest>();

  const {
    data: completedCourseDetailsResponse,
    isPending: completedCourseDetailsPending,
    refetch: refetchCompletedCourses,
    isRefetching: refetchingCompletedCourses,
  } = useGet<CourseDetail[]>('/me/courses', {
    params: {
      algorithm,
      userCourseStatus: UserCourseStatus.COMPLETED,
    } as GetCoursesOfUserRequest,
  });

  const {
    data: planningCourseDetailsResponse,
    isPending: planningCourseDetailsPending,
    refetch: refetchPlanningCourses,
    isRefetching: refetchingPlanningCourses,
  } = useGet<CourseDetail[]>('/me/courses', {
    params: {
      algorithm,
      userCourseStatus: UserCourseStatus.PLANNED,
    } as GetCoursesOfUserRequest,
  });

  const refetchMyCourses = useCallback(() => {
    refetchCompletedCourses();
    refetchPlanningCourses();
  }, [refetchCompletedCourses, refetchPlanningCourses]);

  return (
    <div>
      <MyCoursesSection
        title={
          <span className='flex gap-3'>
            <BookOutlined className='text-primary' />
            <span>
              Các môn dự kiến học{' '}
              <span className='font-normal text-gray-500'>
                ({planningCourseDetailsResponse?.data.length})
              </span>
            </span>
          </span>
        }
        onOk={async (courseIds) => {
          await updateUserCourses({
            url: '/me/courses',
            method: 'PUT',
            data: {
              courseIds,
              userCourseStatus: UserCourseStatus.PLANNED,
              algorithm,
            },
          });
          refetchMyCourses();
        }}
        allCourseDetailsPending={allCourseDetailsPending}
        allCourseDetailsResponse={allCourseDetailsResponse}
        courseDetailsPending={planningCourseDetailsPending}
        courseDetailsResponse={planningCourseDetailsResponse}
        refetching={refetchingPlanningCourses}
      />

      <div className='my-8'></div>

      <MyCoursesSection
        title={
          <span className='flex gap-3'>
            <CheckCircleOutlined className='text-green-500' />
            <span>
              Các môn đã hoàn thành{' '}
              <span className='font-normal text-gray-500'>
                ({completedCourseDetailsResponse?.data.length})
              </span>
            </span>
          </span>
        }
        onOk={async (courseIds) => {
          await updateUserCourses({
            url: '/me/courses',
            method: 'PUT',
            data: {
              courseIds,
              userCourseStatus: UserCourseStatus.COMPLETED,
              algorithm,
            },
          });
          refetchMyCourses();
        }}
        allCourseDetailsPending={allCourseDetailsPending}
        allCourseDetailsResponse={allCourseDetailsResponse}
        courseDetailsPending={completedCourseDetailsPending}
        courseDetailsResponse={completedCourseDetailsResponse}
        refetching={refetchingCompletedCourses}
      />
    </div>
  );
}
