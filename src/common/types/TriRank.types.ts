import { Course, CourseDetail } from './Course.types';
import { FilterCoursesOption } from './Recommendation.types';

export type TriRankRecommendationRequest = {
  numberOfCourses?: number;
  attributeToScore: Record<string, number>;
  filterCoursesOptions: FilterCoursesOption[];
  customFilteredCourseCodes: string[];
};

export type TriRankItemAspect = {
  aspect: string;
  score: number;
};

export type TriRankItemAspectTuple = [string, number];

export type TriRankRecommendationResult = {
  id: number;
  courseDetails: CourseDetail[];
  filterCoursesOptions: FilterCoursesOption[];
  customFilteredCourseCodes: string[];
  itemIdToItemAspects: Record<string, Array<TriRankItemAspect | TriRankItemAspectTuple>>;
};

export type RecommendationSettingsFormType = {
  attributeToScore: Record<string, number>;
  filterCoursesOptions?: FilterCoursesOption[];
  customFilteredCourseCodes?: string[];
};

export type RecommendationSettingsFormProps = {
  attributes: string[];
  allCourses: Course[];
  initialAttributeToScore?: Record<string, number>;
  initialFilterCoursesOptions: FilterCoursesOption[];
  initialCustomFilteredCourseCodes: string[];
  attributeValueToLabel: (value: string) => string;
};
