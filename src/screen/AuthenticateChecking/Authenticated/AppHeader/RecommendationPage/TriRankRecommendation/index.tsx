import CourseStatusButton from '@/common/components/CourseStatusButton';
import RecommendedCourseCard from '@/common/components/RecommendedCourseCard';
import { TRI_RANK_NUMBER_OF_COURSES } from '@/common/constants/Recommendation.constant';
import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import {
  Algorithm,
  Course,
  GetCoursesRequest,
  UserCourseStatus,
} from '@/common/types/Course.types';
import {
  RecommendationSettingsFormType,
  TriRankRecommendationRequest,
  TriRankRecommendationResult,
} from '@/common/types/TriRank.types';
import { QuestionOutlined } from '@ant-design/icons';
import { useStatsigClient } from '@statsig/react-bindings';
import { Button, Empty, Modal, Progress, Skeleton, Spin, Tag, Typography } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect, useState } from 'react';
import RecommendationSettingsForm from '../components/RecommendationSettingsForm';
import RecommendationSettingsSidebar from '../components/RecommendationSettingsSidebar';
import { useAttributeValueToLabel } from '../FSRecommendation/hooks/useAttributeValueToLabel';

export default function TriRankRecommendation() {
  const { client } = useStatsigClient();
  const algorithm = useAlgorithmContext();
  const attributeValueToLabel = useAttributeValueToLabel();

  const [form] = useForm<RecommendationSettingsFormType>();
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

  const { data: allCoursesResponse } = useGet<Course[]>(`/courses`, {
    params: {
      algorithm: Algorithm.TRI_RANK,
    } as GetCoursesRequest,
  });

  const { data: attributesResponse, isPending: attributesPending } = useGet<string[]>(
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
            attributeValueToLabel={attributeValueToLabel}
          />
        );
      })()}
    </>
  );

  return (
    <div className='flex flex-col md:flex-row md:items-center h-full'>
      <div className='w-full h-full flex flex-col md:flex-row gap-4 md:gap-8'>
        <RecommendationSettingsSidebar
          settingsForm={settingsForm}
          recommendButton={recommendButton}
          settingsDrawerOpen={settingsDrawerOpen}
          setSettingsDrawerOpen={setSettingsDrawerOpen}
        />

        <div className='h-full flex flex-col overflow-hidden w-full'>
          <div className='font-bold text-2xl md:text-[26px] shrink-0'>Gợi ý môn học</div>
          <div className='my-3 shrink-0'></div>
          <div className='flex-1 min-h-0'>
            {(() => {
              if (latestTriRankRecommendationResultPending) {
                return <Skeleton />;
              }

              if (!recommendationResult) {
                return (
                  <div className='flex flex-col h-ful'>
                    <Spin spinning={getTriRankRecommendationPending} className='h-full'>
                      <div className='flex items-center justify-center h-full'>
                        <Empty description='Chưa có kết quả gợi ý nào' />
                      </div>
                    </Spin>
                  </div>
                );
              }

              return (
                <div className='h-full overflow-y-auto overscroll-none'>
                  <Spin
                    spinning={
                      getTriRankRecommendationPending || refetchingLatestTriRankRecommendationResult
                    }
                  >
                    <div className='flex flex-col gap-5'>
                      {recommendationResult.courseDetails.map((courseDetail, index) => {
                        const rank = index + 1;
                        const isTopRank = rank <= 3;
                        let rankTagColor: 'gold' | 'geekblue' | 'volcano' | 'blue' = 'blue';
                        if (rank === 1) {
                          rankTagColor = 'gold';
                        } else if (rank === 2) {
                          rankTagColor = 'geekblue';
                        } else if (rank === 3) {
                          rankTagColor = 'volcano';
                        }

                        return (
                          <RecommendedCourseCard
                            key={courseDetail.course.code}
                            courseDetail={courseDetail}
                            onClick={() => {
                              client.logEvent('see_course_detail', undefined, {
                                algorithm,
                                courseCode: courseDetail.course.code,
                              });
                            }}
                            topLeftBadge={
                              <Tag
                                variant={isTopRank ? 'solid' : 'outlined'}
                                color={rankTagColor}
                                className='mr-0 rounded-full px-2 font-semibold'
                              >
                                {isTopRank ? `TOP ${rank}` : `#${rank}`}
                              </Tag>
                            }
                            topRightBadge={
                              getEffectiveUserCourseStatus(
                                courseDetail.course.code,
                                courseDetail.userCourseStatus,
                              ) === UserCourseStatus.COMPLETED ? (
                                <Tag variant='solid' color={'green'}>
                                  Đã hoàn thành
                                </Tag>
                              ) : undefined
                            }
                            extra={
                              <div className='w-full'>
                                <CourseStatusButton
                                  type={'plan'}
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
                                <div className='my-2'></div>
                                <Button
                                  color='primary'
                                  variant='outlined'
                                  icon={<QuestionOutlined />}
                                  className='w-full'
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    client.logEvent('view_explanation', undefined, {
                                      algorithm,
                                      courseCode: courseDetail.course.code,
                                    });

                                    const sortedItemAspects =
                                      recommendationResult.itemIdToItemAspects[
                                        courseDetail.course.code
                                      ].sort((a, b) =>
                                        attributeValueToLabel(a.aspect).localeCompare(
                                          attributeValueToLabel(b.aspect),
                                          'vi',
                                          { sensitivity: 'base' },
                                        ),
                                      );

                                    Modal.info({
                                      title: (
                                        <div className='text-xl font-semibold'>
                                          Giải thích gợi ý môn học
                                        </div>
                                      ),
                                      content: (
                                        <div className='space-y-4'>
                                          <div className='rounded-lg border border-blue-100 bg-blue-50 p-3'>
                                            <Typography.Text className='block font-medium text-blue-700'>
                                              Cách đọc kết quả
                                            </Typography.Text>
                                            <Typography.Text className='text-gray-700'>
                                              Mỗi tiêu chí bên dưới thể hiện mức độ ảnh hưởng đến
                                              gợi ý môn học này.
                                            </Typography.Text>
                                            <Typography.Text className='mt-1 block text-xs text-gray-500'>
                                              Thang điểm: 1 (thấp) → 5 (cao).
                                            </Typography.Text>
                                          </div>
                                          <div className='space-y-3'>
                                            {sortedItemAspects.map((itemAspect) => {
                                              return (
                                                <div
                                                  key={itemAspect.aspect}
                                                  className='rounded-lg border border-gray-100 bg-white p-3 shadow-sm'
                                                >
                                                  <div className='mb-2 flex items-center justify-between gap-2'>
                                                    <Typography.Text className='font-medium text-gray-800'>
                                                      {attributeValueToLabel(itemAspect.aspect)}
                                                    </Typography.Text>
                                                    <Tag
                                                      className='mr-0 rounded-full px-2'
                                                      color='blue'
                                                    >
                                                      {itemAspect.score.toFixed(2)} / 5
                                                    </Tag>
                                                  </div>
                                                  <Progress
                                                    showInfo={false}
                                                    percent={(itemAspect.score / 5) * 100}
                                                    strokeLinecap='round'
                                                    strokeColor={'#1677ff'}
                                                    // trailColor='#f0f5ff'
                                                  />
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ),
                                      okText: 'Đóng',
                                      maskClosable: true,
                                    });
                                  }}
                                >
                                  Giải thích
                                </Button>
                              </div>
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
