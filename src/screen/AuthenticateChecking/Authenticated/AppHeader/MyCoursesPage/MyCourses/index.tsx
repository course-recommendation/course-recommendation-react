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
import { CheckCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
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
      {/*<div className='mb-8'>*/}
      {/*  <div*/}
      {/*    className='text-[28px] font-semibold text-[#1C1917] leading-tight'*/}
      {/*    style={{ fontFamily: 'var(--font-serif)' }}*/}
      {/*  >*/}
      {/*    Môn học của tôi*/}
      {/*  </div>*/}
      {/*  <div className='mt-2 w-10 h-[3px] rounded-full bg-indigo-700' />*/}
      {/*</div>*/}

      <Tabs
        defaultActiveKey='planned'
        items={[
          {
            key: 'planned',
            label: (
              <span className='flex items-center gap-2 text-base'>
                <SaveOutlined style={{ color: '#6366F1' }} />
                Đã lưu ({planningCourseDetailsResponse?.data.length ?? 0})
              </span>
            ),
            children: (
              <MyCoursesSection
                title='Môn học đã lưu'
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
            ),
          },
          {
            key: 'completed',
            label: (
              <span className='flex items-center gap-2 text-base'>
                <CheckCircleOutlined style={{ color: '#22C55E' }} />
                Đã hoàn thành ({completedCourseDetailsResponse?.data.length ?? 0})
              </span>
            ),
            children: (
              <MyCoursesSection
                title='Môn học đã hoàn thành'
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
                showRatingColumn
                algorithm={algorithm}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
