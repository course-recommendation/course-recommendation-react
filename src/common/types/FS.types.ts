import { CourseDetail, Dataset } from './Course.types';
import { FilterCoursesOption } from './Recommendation.types';

export type FSTradeoffPair = {
  attribute: string;
  direction: TradeoffDirection;
};

export enum TradeoffDirection {
  O_UP = 'O_UP',
  O_DOWN = 'O_DOWN',
  V_UP = 'V_UP',
  V_DOWN = 'V_DOWN',
}

export function isDirectionUp(tradeoffDirection: TradeoffDirection) {
  return (
    tradeoffDirection === TradeoffDirection.O_UP || tradeoffDirection === TradeoffDirection.V_UP
  );
}

export type FSRecommendationRequest = {
  dataset: Dataset;
  attributeToPreferenceConfigure: Record<
    string,
    Pick<FSPreferenceConfigure, 'targetSentimentScore'>
  >;
  filterCoursesOptions: FilterCoursesOption[];
  customFilteredCourseCodes: string[];
};

export type FSRefinedRecommendationRequest = {
  dataset: Dataset;
  recommendationId: number;
  itemId: string;
  category: FSTradeoffPair[];
};

export type FSPreferenceConfigure = {
  weight: number;
  targetSentimentScore: number;
};

export type FSCategoryDetail = {
  category: FSTradeoffPair[];
  courseDetails: CourseDetail[];
};

export type FSRecommendationResult = {
  id: number;
  attributeToPreferenceConfigure: Record<string, FSPreferenceConfigure>;
  topCourseDetail: CourseDetail;
  categoryDetails: FSCategoryDetail[];
  itemIdToTradeoffVector: Record<string, FSTradeoffPair[]>;
  filterCoursesOptions: FilterCoursesOption[];
  customFilteredCourseCodes: string[];
};
