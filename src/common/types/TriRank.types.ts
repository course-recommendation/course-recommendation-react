import { Attribute, Course, CourseDetail } from './Course.types';
import { FilterCoursesOption } from './Recommendation.types';

export type TriRankRecommendationRequest = {
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
  itemIdToItemAspects: Record<string, TriRankItemAspect[]>;
};

export type RecommendationSettingsFormType = {
  attributeToScore: Record<string, number>;
  filterCoursesOptions?: FilterCoursesOption[];
  customFilteredCourseCodes?: string[];
};

export type RecommendationSettingsFormProps = {
  attributes: Attribute[];
  allCourses: Course[];
  initialAttributeToScore?: Record<string, number>;
  initialFilterCoursesOptions: FilterCoursesOption[];
  initialCustomFilteredCourseCodes: string[];
  attributeValueToLabel: (value: string) => string;
};
