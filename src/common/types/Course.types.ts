export type Course = {
  id: number;
  code: string;
  name: string;
  description: string;
  thumbnailUrl?: string;
};

export enum UserCourseStatus {
  COMPLETED = 'COMPLETED',
  PLANNING = 'PLANNING',
}

export enum Algorithm {
  FS = 'FS',
  TRI_RANK = 'TRI_RANK',
}

export enum Dataset {
  FIT = 'FIT',
  CELLPHONE = 'CELLPHONE',
}

export type CourseDetail = {
  course: Course;
  userCourseStatuses: UserCourseStatus[];
  userAttributeValueToRatingScore: Record<string, number>;
};

export type Domain = {
  algorithm: Algorithm;
  dataset: Dataset;
};

export type GetCoursesOfUserRequest = {
  domain: Domain;
  userCourseStatus: UserCourseStatus;
};

export type UpdateUserCourseRequest = {
  userCourseStatus: UserCourseStatus;
  courseIds: number[];
  domain: Domain;
};

export type GetCoursesRequest = {
  domain: Domain;
};

export type GetCourseDetailsRequest = {
  domain: Domain;
};

export type GetCourseDetailRequest = {
  domain: Domain;
};

export type RateCourseRequest = {
  attributeValue: string;
  score: number;
};
