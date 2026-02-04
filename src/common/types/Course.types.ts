export type Course = {
  id: string;
  name: string;
};

export enum UserCourseStatus {
  COMPLETED = "COMPLETED",
  PLANNING = "PLANNING",
}

export enum CourseAlgorithm {
  FS = "FS",
  TRI_RANK = "TRI_RANK",
}

export enum CourseDataset {
  FIT = "FIT",
  CELLPHONE = "CELLPHONE",
}

export type CourseDetail = {
  course: Course;
  userCourseStatuses: UserCourseStatus[];
};

export type CourseDomain = {
  algorithm: CourseAlgorithm;
  dataset: CourseDataset;
};

export type GetCoursesOfUserRequest = {
  courseDomain: CourseDomain;
  userCourseStatus: UserCourseStatus;
};

export type UpdateUserCourseRequest = {
  userCourseStatus: UserCourseStatus;
  courseIds: string[];
  courseDomain: CourseDomain;
};

export type GetCoursesRequest = {
  domain: CourseDomain;
};

export type GetCourseDetailsRequest = {
  domain: CourseDomain;
};
