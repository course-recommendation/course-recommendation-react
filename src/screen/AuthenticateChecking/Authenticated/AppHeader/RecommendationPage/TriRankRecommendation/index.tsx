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
  GetCoursesRequest,
  UserCourseStatus,
} from '@/common/types/Course.types';
import { FilterCoursesOption } from '@/common/types/Recommendation.types';
import {
  RecommendationSettingsFormType,
  TriRankRecommendationRequest,
  TriRankRecommendationResult,
} from '@/common/types/TriRank.types';
import { Button, Empty, Select, Skeleton, Spin, Tag } from 'antd';
import useApp from 'antd/es/app/useApp';
import { useForm } from 'antd/es/form/Form';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import RecommendationSettingsForm from '../components/RecommendationSettingsForm';
import RecommendationSettingsSidebar from '../components/RecommendationSettingsSidebar';

const rankBgColors: Record<number, string> = { 1: '#f59e0b', 2: '#94a3b8', 3: '#ea580c' };

function RankBadge({ rank }: { rank: number }) {
  const bg = rankBgColors[rank] ?? '#a8a29e';
  const label = rank <= 3 ? `TOP ${rank}` : `#${rank}`;
  return (
    <div
      className='absolute -left-8 top-5 w-28 py-1 -rotate-45 text-center text-[11px] font-bold tracking-widest text-white shadow-md pointer-events-none select-none z-10'
      style={{ backgroundColor: bg }}
    >
      {label}
    </div>
  );
}

export default function TriRankRecommendation() {
  const logEvent = useLogStatsigEvent();
  const showExplanation = useShowExplanationContext();
  const { message } = useApp();

  const [form] = useForm<RecommendationSettingsFormType>();
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

  const { data: allCoursesResponse } = useGet<Course[]>(`/courses`, {
    params: {
      algorithm: Algorithm.TRI_RANK,
    } as GetCoursesRequest,
  });

  const { data: attributesResponse, isPending: attributesPending } = useGet<Attribute[]>(
    `/attributes`,
    {
      params: {
        algorithm: Algorithm.TRI_RANK,
      },
    },
  );

  const attributeByValue = useMemo(
    () =>
      Object.fromEntries(
        (attributesResponse?.data ?? []).map((attribute) => [attribute.value, attribute]),
      ),
    [attributesResponse],
  );

  const { data: attributeToScoreResponse, isPending: attributeToScorePending } = useGet<
    Record<string, number> | undefined
  >(`/user-preference`, {
    params: {
      algorithm: Algorithm.TRI_RANK,
    },
  });

  const {
    data: latestTriRankRecommendationResultResponse,
    isPending: latestTriRankRecommendationResultPending,
    isRefetching: refetchingLatestTriRankRecommendationResult,
  } = useGet<TriRankRecommendationResult | undefined>(`/tri-rank/latest-recommendation`, {
    params: {},
  });

  const { request: getTriRankRecommendation, isPending: getTriRankRecommendationPending } =
    useRequest<TriRankRecommendationResult, TriRankRecommendationRequest>();

  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const [recommendationResult, setRecommendationResult] = useState<
    TriRankRecommendationResult | undefined
  >(undefined);
  const [courseStatusOverrides, setCourseStatusOverrides] = useState<
    Record<string, UserCourseStatus | undefined>
  >({});
  const [displayLimit, setDisplayLimit] = useState(10);
  // Kết quả TriRank không kèm sở thích, nên lấy từ sở thích đã lưu trên server
  // và ghi đè bằng giá trị form mỗi lần người dùng lấy gợi ý mới.
  const [submittedAttributeToScore, setSubmittedAttributeToScore] = useState<
    Record<string, number> | undefined
  >(undefined);
  const preferenceByAttribute = submittedAttributeToScore ?? attributeToScoreResponse?.data;

  useEffect(() => {
    if (!latestTriRankRecommendationResultPending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecommendationResult(latestTriRankRecommendationResultResponse!.data);
    }
  }, [latestTriRankRecommendationResultPending, latestTriRankRecommendationResultResponse]);

  const getEffectiveUserCourseStatus = (
    courseCode: string,
    fallbackUserCourseStatus?: UserCourseStatus,
  ) => {
    if (courseCode in courseStatusOverrides) {
      return courseStatusOverrides[courseCode];
    }
    return fallbackUserCourseStatus;
  };

  const handleMarkNotInterested = useCallback(
    (courseCode: string) => {
      logEvent(StatsigEvent.MarkNotInterested, undefined, { courseCode });

      const currentCustomCodes: string[] = form.getFieldValue('customFilteredCourseCodes') ?? [];

      form.setFieldsValue({
        customFilteredCourseCodes: Array.from(new Set([...currentCustomCodes, courseCode])),
      });

      message.success(
        'Đã thêm môn học vào danh sách không quan tâm. Nhấn "Xem kết quả" để nhận gợi ý mới.',
      );
    },
    [form, logEvent, message],
  );

  const handleGetRecommendation = async () => {
    logEvent(StatsigEvent.GetRecommendation);
    setSettingsDrawerOpen(false);

    const formValues = await form.validateFields();

    const result = (
      await getTriRankRecommendation({
        method: 'post',
        url: '/tri-rank/recommendation',
        data: {
          attributeToScore: formValues.attributeToScore,
          // Môn đã hoàn thành luôn bị lọc, không còn checkbox để bật/tắt.
          filterCoursesOptions: Array.from(
            new Set([...(formValues.filterCoursesOptions ?? []), FilterCoursesOption.COMPLETED]),
          ),
          customFilteredCourseCodes: formValues.customFilteredCourseCodes ?? [],
        },
      })
    ).data;

    setRecommendationResult(result);
    setSubmittedAttributeToScore(formValues.attributeToScore);
    resultsContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const recommendButton = (
    <Button
      className='w-full'
      type='primary'
      loading={getTriRankRecommendationPending}
      onClick={handleGetRecommendation}
    >
      Xem kết quả
    </Button>
  );

  const settingsForm = (
    <>
      {(() => {
        if (
          attributesPending ||
          attributeToScorePending ||
          latestTriRankRecommendationResultPending
        ) {
          return <Skeleton active />;
        }

        return (
          <RecommendationSettingsForm
            form={form}
            attributes={attributesResponse!.data}
            allCourses={allCoursesResponse?.data ?? []}
            initialAttributeToScore={attributeToScoreResponse!.data}
            initialFilterCoursesOptions={
              latestTriRankRecommendationResultResponse?.data?.filterCoursesOptions ?? []
            }
            initialCustomFilteredCourseCodes={
              latestTriRankRecommendationResultResponse?.data?.customFilteredCourseCodes ?? []
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
            ref={resultsContainerRef}
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
              if (latestTriRankRecommendationResultPending) {
                return <Skeleton active paragraph={{ rows: 6 }} />;
              }

              if (!recommendationResult) {
                return (
                  <Spin spinning={getTriRankRecommendationPending} className='h-full'>
                    <div className='flex items-center justify-center h-48'>
                      <Empty description='Chưa có kết quả gợi ý nào' />
                    </div>
                  </Spin>
                );
              }

              return (
                <Spin
                  spinning={
                    getTriRankRecommendationPending || refetchingLatestTriRankRecommendationResult
                  }
                >
                  <div className='flex items-center justify-end gap-2 mb-5'>
                    <span className='text-sm font-medium text-gray-700'>Hiển thị</span>
                    <Select<number>
                      size='small'
                      value={displayLimit}
                      onChange={(val) => setDisplayLimit(val)}
                      options={[
                        { label: '10', value: 10 },
                        { label: '20', value: 20 },
                        { label: '50', value: 50 },
                        { label: 'Tất cả', value: Number.MAX_SAFE_INTEGER },
                      ]}
                      style={{ width: 90 }}
                    />
                    <span className='text-sm text-gray-500'>môn học</span>
                  </div>

                  <div className='flex flex-col gap-4'>
                    {recommendationResult.courseDetails
                      .slice(0, displayLimit)
                      .map((courseDetail, index) => {
                        const rank = index + 1;

                        return (
                          <RecommendedCourseCard
                            key={courseDetail.course.code}
                            courseDetail={courseDetail}
                            index={index}
                            rank={rank}
                            explanationScores={
                              showExplanation
                                ? (
                                    recommendationResult.itemIdToItemAspects[
                                      courseDetail.course.code
                                    ] ?? []
                                  ).map((a) => ({
                                    label: a.aspect,
                                    score: a.score,
                                    preferenceScore: preferenceByAttribute?.[a.aspect],
                                    lowLabel: attributeByValue[a.aspect]?.lowLabel,
                                    highLabel: attributeByValue[a.aspect]?.highLabel,
                                  }))
                                : undefined
                            }
                            onClick={() => {
                              logEvent(StatsigEvent.SeeCourseDetail, undefined, {
                                courseCode: courseDetail.course.code,
                                rank: String(rank),
                              });
                            }}
                            onMarkNotInterested={() =>
                              handleMarkNotInterested(courseDetail.course.code)
                            }
                            topLeftBadge={<RankBadge rank={rank} />}
                            topRightBadge={
                              getEffectiveUserCourseStatus(
                                courseDetail.course.code,
                                courseDetail.userCourseStatus,
                              ) === UserCourseStatus.COMPLETED ? (
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
                                  getEffectiveUserCourseStatus(
                                    courseDetail.course.code,
                                    courseDetail.userCourseStatus,
                                  ) === UserCourseStatus.PLANNED
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
                                  setCourseStatusOverrides((prev) => ({
                                    ...prev,
                                    [courseDetail.course.code]: marked
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
