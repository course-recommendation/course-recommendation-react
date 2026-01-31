import useGet from "@/common/hooks/network/useGet";
import useRequest from "@/common/hooks/network/useRequest";
import {
  CourseAlgorithm,
  CourseDataset,
  CourseDetail,
  CourseDomain,
  GetCoursesOfUserRequest,
  UpdateUserCourseRequest as UpdateUserCoursesRequest,
  UserCourseStatus,
} from "@/common/types/Course.types";
import MyCoursesCard from "@/screen/AuthenticateChecking/Authenticated/AppHeader/MyCoursesPage/components/MyCoursesCard";

type Props = {
  algorithm: CourseAlgorithm;
  dataset: CourseDataset;
};

export default function MyCourses({ algorithm, dataset }: Props) {
  const { data: allCourseDetailsResponse, isPending: allCourseDetailsPending } = useGet<
    CourseDetail[]
  >("/courses", {
    params: {
      algorithm,
      dataset,
    } as CourseDomain,
  });

  const { request: updateUserCourses } = useRequest<void, UpdateUserCoursesRequest>();

  const {
    data: completedCourseDetailsResponse,
    isPending: completedCourseDetailsPending,
    refetch: refetchCompletedCourses,
    isRefetching: refetchingCompletedCourses,
  } = useGet<CourseDetail[]>("/me/courses", {
    params: {
      courseDomain: {
        algorithm,
        dataset,
      },
      userCourseStatus: UserCourseStatus.COMPLETED,
    } as GetCoursesOfUserRequest,
  });

  const {
    data: planningCourseDetailsResponse,
    isPending: planningCourseDetailsPending,
    refetch: refetchPlanningCourses,
    isRefetching: refetchingPlanningCourses,
  } = useGet<CourseDetail[]>("/me/courses", {
    params: {
      courseDomain: {
        algorithm,
        dataset,
      },
      userCourseStatus: UserCourseStatus.PLANNING,
    } as GetCoursesOfUserRequest,
  });

  return (
    <div className="p-8">
      <MyCoursesCard
        title={"Các môn dự kiến học"}
        onOk={async (courseIds) => {
          await updateUserCourses({
            url: "/me/courses",
            method: "PUT",
            data: {
              courseIds,
              userCourseStatus: UserCourseStatus.PLANNING,
              courseDomain: {
                algorithm,
                dataset,
              },
            },
          });
          refetchPlanningCourses();
        }}
        allCourseDetailsPending={allCourseDetailsPending}
        allCourseDetailsResponse={allCourseDetailsResponse}
        courseDetailsPending={planningCourseDetailsPending}
        courseDetailsResponse={planningCourseDetailsResponse}
        refetching={refetchingPlanningCourses}
      />

      <div className="my-8"></div>

      <MyCoursesCard
        title={"Các môn đã hoàn thành"}
        onOk={async (courseIds) => {
          await updateUserCourses({
            url: "/me/courses",
            method: "PUT",
            data: {
              courseIds,
              userCourseStatus: UserCourseStatus.COMPLETED,
              courseDomain: {
                algorithm,
                dataset,
              },
            },
          });
          refetchCompletedCourses();
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
