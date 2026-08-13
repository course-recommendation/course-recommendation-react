import { CourseDetail } from './Course.types';
import { FilterCoursesOption } from './Recommendation.types';

export type FSTradeoffPair = {
  attribute: string;
  direction: TradeoffDirection;
};

/**
 * Chiều tradeoff của một thuộc tính so với môn đầu tiên: cải thiện (↑) hay đánh đổi (↓).
 *
 * Tên "UP"/"DOWN" giữ lại theo lịch sử vì các giá trị này được lưu nguyên văn trong
 * kết quả gợi ý đã persist; chúng không còn nghĩa "nghiêng về cực cao" nữa mà là
 * "gần / xa sở thích của người dùng hơn".
 */
export enum TradeoffDirection {
  O_UP = 'O_UP',
  O_DOWN = 'O_DOWN',
  V_UP = 'V_UP',
  V_DOWN = 'V_DOWN',
}

/** Môn có gần với sở thích người dùng hơn môn đầu tiên ở thuộc tính này không. */
export function isDirectionImproved(tradeoffDirection: TradeoffDirection) {
  return (
    tradeoffDirection === TradeoffDirection.O_UP || tradeoffDirection === TradeoffDirection.V_UP
  );
}

export type FSRecommendationRequest = {
  attributeToPreferenceConfigure: Record<
    string,
    Pick<FSPreferenceConfigure, 'targetSentimentScore'>
  >;
  filterCoursesOptions: FilterCoursesOption[];
  customFilteredCourseCodes: string[];
};

export type FSRefinedRecommendationRequest = {
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

export type FsItemSentiment = {
  attribute: string;
  sentimentScore: number;
};

export type FSRecommendationResult = {
  id: number;
  attributeToPreferenceConfigure: Record<string, FSPreferenceConfigure>;
  topCourseDetail: CourseDetail;
  categoryDetails: FSCategoryDetail[];
  itemIdToTradeoffVector: Record<string, FSTradeoffPair[]>;
  filterCoursesOptions: FilterCoursesOption[];
  customFilteredCourseCodes: string[];
  itemIdToItemSentiments: Record<string, FsItemSentiment[]>;
};
