import TrendingDown from '@/assets/icons/TrendingDown';
import TrendingUp from '@/assets/icons/TrendingUp';
import CourseStatusButton from '@/common/components/CourseStatusButton';
import RecommendedCourseCard from '@/common/components/RecommendedCourseCard';
import { useShowExplanationContext } from '@/common/context/ShowExplanationContext';
import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import { StatsigEvent } from '@/common/constants/StatsigEvent.ts';
import { useLogStatsigEvent } from '@/common/hooks/useLogStatsigEvent.ts';
import {
  Algorithm,
  Attribute,
  Course,
  CourseDetail,
  GetCoursesRequest,
  UserCourseStatus,
} from '@/common/types/Course.types';
import {
  FSCategoryDetail,
  FsItemSentiment,
  FSRecommendationRequest,
  FSRecommendationResult,
  FSRefinedRecommendationRequest,
  FSTradeoffPair,
  isDirectionUp,
} from '@/common/types/FS.types';
import { RecommendationSettingsFormType } from '@/common/types/TriRank.types';
import { ArrowUpOutlined, QuestionOutlined, StarFilled } from '@ant-design/icons';
import { Button, Empty, Skeleton, Space, Spin, Tag, Typography } from 'antd';
import useApp from 'antd/es/app/useApp';
import { useForm } from 'antd/es/form/Form';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import RecommendationSettingsForm from '../components/RecommendationSettingsForm';
import RecommendationSettingsSidebar from '../components/RecommendationSettingsSidebar';

const CARD_SHADOW = '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)';
const PAGE_SIZE = 5;

type CategorySectionProps = {
  categoryDetail: FSCategoryDetail;
  catIdx: number;
  visibleCount: number;
  onShowMore: (catIdx: number) => void;
  itemIdToItemSentiments: Record<string, FsItemSentiment[]>;
  courseStatusOverrides: Record<string, UserCourseStatus | undefined>;
  onCourseStatusChange: (courseCode: string, status: UserCourseStatus | undefined) => void;
  onRefinedRecommendation: (itemId: string, category: FSTradeoffPair[]) => Promise<void>;
  onScrollToTop: () => void;
  rankOffset: number;
  showExplanation: boolean;
};

const CategorySection = memo(function CategorySection({
  categoryDetail,
  catIdx,
  visibleCount,
  onShowMore,
  itemIdToItemSentiments,
  courseStatusOverrides,
  onCourseStatusChange,
  onRefinedRecommendation,
  onScrollToTop,
  rankOffset,
  showExplanation,
}: CategorySectionProps) {
  const logEvent = useLogStatsigEvent();
  const { modal } = useApp();

  const getExplanationScores = (courseCode: string) =>
    (itemIdToItemSentiments[courseCode] ?? []).map((s) => ({
      label: s.attribute,
      score: s.sentimentScore,
    }));

  const getEffectiveStatus = (courseDetail: CourseDetail) => {
    if (courseDetail.course.code in courseStatusOverrides) {
      return courseStatusOverrides[courseDetail.course.code];
    }
    return courseDetail.userCourseStatus;
  };

  return (
    <div className='rounded-xl bg-white border border-stone-200' style={{ boxShadow: CARD_SHADOW }}>
      {/* Sticky category header — note: no overflow-hidden on parent so sticky works */}
      <div className='sticky top-0 z-20 rounded-t-xl bg-violet-50 border-b border-violet-200 px-6 py-4'>
        <Typography.Text strong className='text-[16px] m-0 flex items-center gap-3'>
          {/*<span className='inline-block w-1.5 h-6 rounded-full bg-indigo-600 shrink-0'></span>*/}
          <span className={'text-primary'}>#{catIdx + 1} - </span>
          <span>
            {categoryDetail.category.map((tradeoffPair, idx) => {
              const isUp = isDirectionUp(tradeoffPair.direction);
              return (
                <span key={`${tradeoffPair.attribute}-${tradeoffPair.direction}`}>
                  {idx > 0 && ', '}
                  {isUp ? (
                    <TrendingUp className='inline mr-1.5 text-emerald-600' />
                  ) : (
                    <TrendingDown className='inline mr-1.5 text-red-500' />
                  )}
                  <span className='text-indigo-700'>{tradeoffPair.attribute}</span>
                  {` ${isUp ? 'tốt hơn' : 'tệ hơn'}`}
                </span>
              );
            })}
            <span className='text-gray-400 font-normal text-sm ml-2'>
              ({categoryDetail.courseDetails.length} môn)
            </span>
          </span>
        </Typography.Text>
      </div>

      {/* Course cards grid */}
      <div className='flex flex-col gap-3 px-6 py-5'>
        {categoryDetail.courseDetails.slice(0, visibleCount).map((courseDetail, courseIdx) => {
          const rank = rankOffset + courseIdx;
          return (
            <RecommendedCourseCard
              key={courseDetail.course.code}
              courseDetail={courseDetail}
              index={catIdx * 10 + courseIdx + 1}
              rank={rank}
              explanationScores={
                showExplanation ? getExplanationScores(courseDetail.course.code) : undefined
              }
              onClick={() => {
                logEvent(StatsigEvent.SeeCourseDetail, undefined, {
                  courseCode: courseDetail.course.code,
                  rank: String(rank),
                });
              }}
              topRightBadge={
                getEffectiveStatus(courseDetail) === UserCourseStatus.COMPLETED ? (
                  <Tag variant='solid' color='green'>
                    Đã hoàn thành
                  </Tag>
                ) : undefined
              }
              extra={
                <div className='w-full flex flex-col sm:flex-row gap-2'>
                  <CourseStatusButton
                    type='plan'
                    className='w-full'
                    marked={getEffectiveStatus(courseDetail) === UserCourseStatus.PLANNED}
                    courseId={courseDetail.course.id}
                    onMarkChange={(marked) => {
                      if (marked) {
                        logEvent(StatsigEvent.ClickPlanned, undefined, {
                          courseCode: courseDetail.course.code,
                          page: 'recommendation',
                          rank: String(rank),
                        });
                      }
                      onCourseStatusChange(
                        courseDetail.course.code,
                        marked ? UserCourseStatus.PLANNED : undefined,
                      );
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  />
                  <Space.Compact className='w-full'>
                    <Button
                      icon={<ArrowUpOutlined />}
                      color='primary'
                      variant='outlined'
                      className='w-full'
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        logEvent(StatsigEvent.GetRefinedRecommendation, undefined, {
                          courseCode: courseDetail.course.code,
                          rank: String(rank),
                        });

                        await onRefinedRecommendation(
                          courseDetail.course.code,
                          categoryDetail.category,
                        );

                        onScrollToTop();
                      }}
                    >
                      Tương tự
                    </Button>
                    <Button
                      color='primary'
                      variant='outlined'
                      icon={<QuestionOutlined />}
                      onClick={(e) => {
                        e.preventDefault();
                        modal.info({
                          title: (
                            <div className='text-xl font-semibold'>
                              Gợi ý tương tự hoạt động thế nào?
                            </div>
                          ),
                          content: (
                            <div className='text-gray-600 text-[15px] leading-[1.7]'>
                              Tìm các môn có trải nghiệm gần giống với nhóm gợi ý bạn đang xem. Kết
                              quả mới sẽ thay thế danh sách hiện tại.
                            </div>
                          ),
                          okText: 'Đã hiểu',
                          maskClosable: true,
                        });
                      }}
                    ></Button>
                  </Space.Compact>
                </div>
              }
            />
          );
        })}
        {visibleCount < categoryDetail.courseDetails.length && (
          <Button type='text' className='w-full text-indigo-700' onClick={() => onShowMore(catIdx)}>
            Xem tất cả ({categoryDetail.courseDetails.length - visibleCount} môn nữa)
          </Button>
        )}
      </div>
    </div>
  );
});

export default function FSRecommendation() {
  const logEvent = useLogStatsigEvent();
  const showExplanation = useShowExplanationContext();

  const { data: allCoursesResponse } = useGet<Course[]>(`/courses`, {
    params: {
      algorithm: Algorithm.FS,
    } as GetCoursesRequest,
  });

  const [form] = useForm<RecommendationSettingsFormType>();
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

  const { data: attributesResponse, isPending: attributesPending } = useGet<Attribute[]>(
    `/attributes`,
    {
      params: {
        algorithm: Algorithm.FS,
      },
    },
  );

  const { data: attributeToScoreResponse, isPending: attributeToScorePending } = useGet<
    Record<string, number> | undefined
  >(`/user-preference`, {
    params: {
      algorithm: Algorithm.FS,
    },
  });

  const {
    data: latestFSRecommendationResultResponse,
    isPending: latestFSRecommendationResultPending,
    isRefetching: refetchingLatestFSRecommendationResult,
  } = useGet<FSRecommendationResult | undefined>(`/fs/latest-recommendation`, {
    params: {},
  });

  const { request: getFSRecommendation, isPending: getFSRecommendationPending } = useRequest<
    FSRecommendationResult,
    FSRecommendationRequest
  >();

  const { request: getRefinedFSRecommendation, isPending: getRefinedFSRecommendationPending } =
    useRequest<FSRecommendationResult, FSRefinedRecommendationRequest>();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [recommendationResult, setRecommendationResult] = useState<
    FSRecommendationResult | undefined
  >(undefined);
  const [courseStatusOverrides, setCourseStatusOverrides] = useState<
    Record<string, UserCourseStatus | undefined>
  >({});
  const [categoryVisibleCount, setCategoryVisibleCount] = useState<Record<number, number>>({});

  const getVisibleCount = (catIdx: number) => categoryVisibleCount[catIdx] ?? PAGE_SIZE;

  useEffect(() => {
    if (!latestFSRecommendationResultPending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecommendationResult(latestFSRecommendationResultResponse!.data);
    }
  }, [latestFSRecommendationResultPending, latestFSRecommendationResultResponse]);

  const handleGetRecommendation = async () => {
    logEvent(StatsigEvent.GetRecommendation);
    setSettingsDrawerOpen(false);

    const formValues = await form.validateFields();

    const result = (
      await getFSRecommendation({
        method: 'post',
        url: '/fs/recommendation',
        data: {
          attributeToPreferenceConfigure: Object.fromEntries(
            Object.entries(formValues.attributeToScore).map(([key, value]) => [
              key,
              { targetSentimentScore: value },
            ]),
          ),
          filterCoursesOptions: formValues.filterCoursesOptions ?? [],
          customFilteredCourseCodes: formValues.customFilteredCourseCodes ?? [],
        },
      })
    ).data;

    setRecommendationResult(result);
    scrollToTop();
  };

  const handleShowMore = useCallback((catIdx: number) => {
    setCategoryVisibleCount((prev) => ({
      ...prev,
      [catIdx]: Infinity,
    }));
  }, []);

  const handleCourseStatusChange = useCallback(
    (courseCode: string, status: UserCourseStatus | undefined) => {
      setCourseStatusOverrides((prev) => ({ ...prev, [courseCode]: status }));
    },
    [],
  );

  const handleRefinedRecommendation = async (itemId: string, category: FSTradeoffPair[]) => {
    const result = (
      await getRefinedFSRecommendation({
        url: '/fs/recommendation/refined',
        method: 'post',
        data: {
          recommendationId: recommendationResult!.id,
          itemId,
          category,
        },
      })
    ).data;

    setRecommendationResult(result);
  };

  const recommendButton = (
    <Button
      className='w-full'
      type='primary'
      loading={getFSRecommendationPending}
      onClick={handleGetRecommendation}
    >
      Xem kết quả
    </Button>
  );

  const getExplanationScores = (
    courseCode: string,
    itemIdToItemSentiments: Record<string, FsItemSentiment[]>,
  ) =>
    (itemIdToItemSentiments[courseCode] ?? []).map((s) => ({
      label: s.attribute,
      score: s.sentimentScore,
    }));

  const getEffectiveUserCourseStatus = (courseDetail: CourseDetail) => {
    if (courseDetail.course.code in courseStatusOverrides) {
      return courseStatusOverrides[courseDetail.course.code];
    }
    return courseDetail.userCourseStatus;
  };

  const settingsForm = (
    <>
      {(() => {
        if (attributesPending || attributeToScorePending || latestFSRecommendationResultPending) {
          return <Skeleton active />;
        }

        return (
          <RecommendationSettingsForm
            form={form}
            attributes={attributesResponse!.data}
            allCourses={allCoursesResponse?.data ?? []}
            initialAttributeToScore={attributeToScoreResponse!.data}
            initialFilterCoursesOptions={
              latestFSRecommendationResultResponse?.data?.filterCoursesOptions ?? []
            }
            initialCustomFilteredCourseCodes={
              latestFSRecommendationResultResponse?.data?.customFilteredCourseCodes ?? []
            }
          />
        );
      })()}
    </>
  );

  return (
    <div className='flex flex-col md:flex-row md:items-center md:h-full'>
      <div className='w-full flex flex-col md:flex-row md:h-full gap-4 md:gap-8'>
        <RecommendationSettingsSidebar
          settingsForm={settingsForm}
          recommendButton={recommendButton}
          settingsDrawerOpen={settingsDrawerOpen}
          setSettingsDrawerOpen={setSettingsDrawerOpen}
        />

        <div className='flex flex-col md:h-full md:overflow-hidden w-full'>
          <div
            ref={scrollContainerRef}
            className='md:flex-1 md:min-h-0 md:overflow-y-auto overscroll-none'
          >
            {/*<div className='mb-4'>*/}
            {/*  <div*/}
            {/*    className='font-bold text-[28px] text-[#1C1917] leading-tight'*/}
            {/*    style={{ fontFamily: 'var(--font-serif)' }}*/}
            {/*  >*/}
            {/*    Gợi ý môn học*/}
            {/*  </div>*/}
            {/*  <div className='mt-2 w-8 h-[3px] rounded-full bg-indigo-700'></div>*/}
            {/*</div>*/}

            {(() => {
              if (latestFSRecommendationResultPending) {
                return <Skeleton active paragraph={{ rows: 6 }} />;
              }
              if (!recommendationResult) {
                return (
                  <Spin spinning={getFSRecommendationPending} className='h-full'>
                    <div className='flex items-center justify-center h-48'>
                      <Empty description='Chưa có kết quả gợi ý nào' />
                    </div>
                  </Spin>
                );
              }

              const topCourseDetail = recommendationResult.topCourseDetail;

              if (!showExplanation) {
                const flatCourseDetails = [
                  topCourseDetail,
                  ...recommendationResult.categoryDetails.flatMap((cd) => cd.courseDetails),
                ];

                return (
                  <Spin
                    spinning={
                      getRefinedFSRecommendationPending ||
                      getFSRecommendationPending ||
                      refetchingLatestFSRecommendationResult
                    }
                  >
                    <div className='flex flex-col gap-4'>
                      {flatCourseDetails.map((courseDetail, index) => {
                        const rank = index + 1;
                        return (
                          <RecommendedCourseCard
                            key={courseDetail.course.code}
                            courseDetail={courseDetail}
                            index={index}
                            rank={rank}
                            onClick={() => {
                              logEvent(StatsigEvent.SeeCourseDetail, undefined, {
                                courseCode: courseDetail.course.code,
                                rank: String(rank),
                              });
                            }}
                            topRightBadge={
                              getEffectiveUserCourseStatus(courseDetail) ===
                              UserCourseStatus.COMPLETED ? (
                                <Tag variant='solid' color='green'>
                                  Đã hoàn thành
                                </Tag>
                              ) : undefined
                            }
                            extra={
                              <CourseStatusButton
                                type='plan'
                                className='w-full'
                                marked={
                                  getEffectiveUserCourseStatus(courseDetail) ===
                                  UserCourseStatus.PLANNED
                                }
                                courseId={courseDetail.course.id}
                                onMarkChange={(marked) => {
                                  if (marked) {
                                    logEvent(StatsigEvent.ClickPlanned, undefined, {
                                      courseCode: courseDetail.course.code,
                                      page: 'recommendation',
                                      rank: String(rank),
                                    });
                                  }
                                  handleCourseStatusChange(
                                    courseDetail.course.code,
                                    marked ? UserCourseStatus.PLANNED : undefined,
                                  );
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              />
                            }
                          />
                        );
                      })}
                    </div>
                  </Spin>
                );
              }

              return (
                <Spin
                  spinning={
                    getRefinedFSRecommendationPending ||
                    getFSRecommendationPending ||
                    refetchingLatestFSRecommendationResult
                  }
                >
                  {/* Top course — featured section */}
                  <div
                    className='relative rounded-xl p-5 bg-indigo-50 border border-indigo-200'
                    style={{ boxShadow: CARD_SHADOW }}
                  >
                    <div className='flex items-start gap-3 mb-5'>
                      <StarFilled className='text-amber-500 text-xl shrink-0 mt-0.5' />
                      <div>
                        <div className='text-[18px] font-semibold text-[#1C1917]'>
                          Môn học phù hợp nhất
                        </div>
                        <div className='text-sm text-gray-500 mt-0.5'>
                          Kết quả tốt nhất theo tiêu chí của bạn
                        </div>
                      </div>
                    </div>

                    <RecommendedCourseCard
                      courseDetail={topCourseDetail}
                      index={0}
                      rank={1}
                      explanationScores={getExplanationScores(
                        topCourseDetail.course.code,
                        recommendationResult.itemIdToItemSentiments,
                      )}
                      onClick={() => {
                        logEvent(StatsigEvent.SeeCourseDetail, undefined, {
                          courseCode: topCourseDetail.course.code,
                          rank: '1',
                        });
                      }}
                      topRightBadge={
                        getEffectiveUserCourseStatus(topCourseDetail) ===
                        UserCourseStatus.COMPLETED ? (
                          <Tag variant='solid' color='green'>
                            Đã hoàn thành
                          </Tag>
                        ) : undefined
                      }
                      extra={
                        <CourseStatusButton
                          type='plan'
                          className='w-full'
                          marked={
                            getEffectiveUserCourseStatus(topCourseDetail) ===
                            UserCourseStatus.PLANNED
                          }
                          courseId={topCourseDetail.course.id}
                          onMarkChange={(marked) => {
                            if (marked) {
                              logEvent(StatsigEvent.ClickPlanned, undefined, {
                                courseCode: topCourseDetail.course.code,
                                page: 'recommendation',
                                rank: '1',
                              });
                            }
                            setCourseStatusOverrides((prev) => ({
                              ...prev,
                              [topCourseDetail.course.code]: marked
                                ? UserCourseStatus.PLANNED
                                : undefined,
                            }));
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        />
                      }
                    />
                  </div>

                  <div className='my-5'></div>

                  {/* Category sections */}
                  <div className='flex flex-col gap-5'>
                    {recommendationResult.categoryDetails.map((categoryDetail, catIdx) => {
                      const rankOffset =
                        2 +
                        recommendationResult.categoryDetails
                          .slice(0, catIdx)
                          .reduce((sum, cat) => sum + cat.courseDetails.length, 0);
                      return (
                        <CategorySection
                          key={categoryDetail.category
                            .map((p) => `${p.attribute}:${p.direction}`)
                            .join('|')}
                          categoryDetail={categoryDetail}
                          catIdx={catIdx}
                          visibleCount={getVisibleCount(catIdx)}
                          onShowMore={handleShowMore}
                          itemIdToItemSentiments={recommendationResult.itemIdToItemSentiments}
                          courseStatusOverrides={courseStatusOverrides}
                          onCourseStatusChange={handleCourseStatusChange}
                          onRefinedRecommendation={handleRefinedRecommendation}
                          onScrollToTop={scrollToTop}
                          rankOffset={rankOffset}
                          showExplanation={showExplanation}
                        />
                      );
                    })}
                  </div>
                </Spin>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
