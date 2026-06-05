import CourseStatusButton from '@/common/components/CourseStatusButton';
import RecommendedCourseCard from '@/common/components/RecommendedCourseCard';
import { TRI_RANK_NUMBER_OF_COURSES } from '@/common/constants/Recommendation.constant';
import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import {
  Algorithm,
  Attribute,
  Course,
  GetCoursesRequest,
  UserCourseStatus,
} from '@/common/types/Course.types';
import {
  RecommendationSettingsFormType,
  TriRankRecommendationRequest,
  TriRankRecommendationResult,
} from '@/common/types/TriRank.types';
import { scoreColor, scoreTrail } from '@/common/utils/scoreColor';
import { useStatsigClient } from '@statsig/react-bindings';
import { Button, Empty, Progress, Skeleton, Spin, Tag } from 'antd';
import useApp from 'antd/es/app/useApp';
import { useForm } from 'antd/es/form/Form';
import { useEffect, useState } from 'react';
import RecommendationSettingsForm from '../components/RecommendationSettingsForm';
import RecommendationSettingsSidebar from '../components/RecommendationSettingsSidebar';

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold tracking-wide shadow-sm'>
        TOP 1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-500 text-white text-xs font-bold tracking-wide shadow-sm'>
        TOP 2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold tracking-wide shadow-sm'>
        TOP 3
      </span>
    );
  }
  return (
    <span className='inline-flex items-center px-2.5 py-1 rounded-full bg-stone-400 text-white text-xs font-semibold shadow-sm'>
      #{rank}
    </span>
  );
}

export default function TriRankRecommendation() {
  const { client } = useStatsigClient();
  const algorithm = useAlgorithmContext();
  const { modal } = useApp();

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

  const [recommendationResult, setRecommendationResult] = useState<
    TriRankRecommendationResult | undefined
  >(undefined);
  const [courseStatusOverrides, setCourseStatusOverrides] = useState<
    Record<string, UserCourseStatus | undefined>
  >({});

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

  const handleGetRecommendation = async () => {
    client.logEvent('get_recommendation', undefined, { algorithm });
    setSettingsDrawerOpen(false);

    const formValues = await form.validateFields();

    const result = (
      await getTriRankRecommendation({
        method: 'post',
        url: '/tri-rank/recommendation',
        data: {
          numberOfCourses: TRI_RANK_NUMBER_OF_COURSES,
          attributeToScore: formValues.attributeToScore,
          filterCoursesOptions: formValues.filterCoursesOptions ?? [],
          customFilteredCourseCodes: formValues.customFilteredCourseCodes ?? [],
        },
      })
    ).data;

    setRecommendationResult(result);
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
          {/* Section heading */}
          <div className='shrink-0'>
            <div
              className='font-bold text-[28px] text-[#1C1917] leading-tight'
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Gợi ý môn học
            </div>
            <div className='mt-2 w-8 h-[3px] rounded-full bg-indigo-700'></div>
          </div>

          <div className='my-4 shrink-0'></div>

          <div className='md:flex-1 md:min-h-0'>
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
                <div className='md:h-full md:overflow-y-auto overscroll-none'>
                  <Spin
                    spinning={
                      getTriRankRecommendationPending || refetchingLatestTriRankRecommendationResult
                    }
                  >
                    {/* AI badge above list */}
                    <div className='flex items-center justify-between mb-5'>
                      <span className='text-sm font-medium text-gray-700'>
                        {recommendationResult.courseDetails.length} môn học được gợi ý
                      </span>
                      {/* <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] text-xs font-semibold tracking-wide'>
                        ✦ AI-powered
                      </span> */}
                    </div>

                    <div className='flex flex-col gap-4'>
                      {recommendationResult.courseDetails.map((courseDetail, index) => {
                        const rank = index + 1;

                        return (
                          <RecommendedCourseCard
                            key={courseDetail.course.code}
                            courseDetail={courseDetail}
                            index={index}
                            explanationScores={(
                              recommendationResult.itemIdToItemAspects[courseDetail.course.code] ??
                              []
                            ).map((a) => ({ label: a.aspect, score: a.score }))}
                            onSeeFullExplanation={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              client.logEvent('view_explanation', undefined, {
                                algorithm,
                                courseCode: courseDetail.course.code,
                                rank: String(rank),
                              });

                              const sortedItemAspects = (
                                recommendationResult.itemIdToItemAspects[
                                  courseDetail.course.code
                                ] ?? []
                              ).sort((a, b) =>
                                a.aspect.localeCompare(b.aspect, 'vi', { sensitivity: 'base' }),
                              );

                              modal.info({
                                title: (
                                  <div className='text-xl font-semibold'>Điểm số các tiêu chí</div>
                                ),
                                content: (
                                  <div className='space-y-3'>
                                    <div className='text-gray-600 text-[15px] leading-[1.7]'>
                                      Điểm cảm nhận trung bình của sinh viên cho từng tiêu chí.
                                      Thang điểm từ 1 đến 5.
                                    </div>
                                    {sortedItemAspects.map((itemAspect) => (
                                      <div key={itemAspect.aspect}>
                                        <div className='flex justify-between items-center mb-1'>
                                          <span className='text-sm text-gray-700 font-medium'>
                                            {itemAspect.aspect}
                                          </span>
                                          <span
                                            className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold'
                                            style={{
                                              background: scoreTrail(itemAspect.score),
                                              color: scoreColor(itemAspect.score),
                                            }}
                                          >
                                            {itemAspect.score.toFixed(2)} / 5
                                          </span>
                                        </div>
                                        <Progress
                                          showInfo={false}
                                          percent={(itemAspect.score / 5) * 100}
                                          strokeLinecap='round'
                                          strokeColor={scoreColor(itemAspect.score)}
                                          trailColor={scoreTrail(itemAspect.score)}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                ),
                                okText: 'Đóng',
                                maskClosable: true,
                              });
                            }}
                            onClick={() => {
                              client.logEvent('see_course_detail', undefined, {
                                algorithm,
                                courseCode: courseDetail.course.code,
                                rank: String(rank),
                              });
                            }}
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
                                    client.logEvent('click_planned', undefined, {
                                      algorithm,
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
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
