export type Attribute = {
  id: number;
  value: string;
};

export type Course = {
  id: number;
  code: string;
  name: string;
  description: string;
  thumbnailUrl?: string;
};

export enum UserCourseStatus {
  COMPLETED = 'COMPLETED',
  PLANNED = 'PLANNED',
}

export enum Algorithm {
  FS = 'FS',
  TRI_RANK = 'TRI_RANK',
}

export type CourseDetail = {
  course: Course;
  userCourseStatus?: UserCourseStatus;
  userAttributeIdToRatingScore: Record<number, number>;
};

export type GetCoursesOfUserRequest = {
  algorithm: Algorithm;
  userCourseStatus: UserCourseStatus;
};

export type UpdateUserCourseStatusesRequest = {
  userCourseStatus: UserCourseStatus;
  courseIds: number[];
  algorithm: Algorithm;
};

export type GetCoursesRequest = {
  algorithm: Algorithm;
};

export type GetCourseDetailsRequest = {
  algorithm: Algorithm;
};

export type GetCourseDetailRequest = {
  algorithm: Algorithm;
};

export type RateCourseRequest = {
  attributeId: number;
  score: number;
};

export type UpdateUserCourseStatusRequest = {
  status: UserCourseStatus;
};
