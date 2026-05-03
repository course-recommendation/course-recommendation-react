import TrendingDown from '@/assets/icons/TrendingDown';
import TrendingUp from '@/assets/icons/TrendingUp';
import CourseStatusButton from '@/common/components/CourseStatusButton';
import RecommendedCourseCard from '@/common/components/RecommendedCourseCard';
import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import {
  Algorithm,
  Course,
  CourseDetail,
  GetCoursesRequest,
  UserCourseStatus,
} from '@/common/types/Course.types';
import {
  FsItemSentiment,
  FSRecommendationRequest,
  FSRecommendationResult,
  FSRefinedRecommendationRequest,
  isDirectionUp,
} from '@/common/types/FS.types';
import { RecommendationSettingsFormType } from '@/common/types/TriRank.types';
import {
  ArrowUpOutlined,
  QuestionCircleFilled,
  QuestionOutlined,
  StarFilled,
} from '@ant-design/icons';
import { Button, Card, Empty, Modal, Skeleton, Space, Spin, Table, Tag, Typography } from 'antd';
import useApp from 'antd/es/app/useApp';
import { useForm } from 'antd/es/form/Form';
import { useEffect, useState } from 'react';
import RecommendationSettingsForm from '../components/RecommendationSettingsForm';
import RecommendationSettingsSidebar from '../components/RecommendationSettingsSidebar';
import { useAttributeValueToLabel } from './hooks/useAttributeValueToLabel';

export default function FSRecommendation() {
  const attributeValueToLabel = useAttributeValueToLabel();
  const { modal } = useApp();

  const { data: allCoursesResponse } = useGet<Course[]>(`/courses`, {
    params: {
      algorithm: Algorithm.FS,
    } as GetCoursesRequest,
  });

  const [form] = useForm<RecommendationSettingsFormType>();
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

  const { data: attributesResponse, isPending: attributesPending } = useGet<string[]>(
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

  const [recommendationResult, setRecommendationResult] = useState<
    FSRecommendationResult | undefined
  >(undefined);
  const [courseStatusOverrides, setCourseStatusOverrides] = useState<
    Record<string, UserCourseStatus | undefined>
  >({});

  useEffect(() => {
    if (!latestFSRecommendationResultPending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecommendationResult(latestFSRecommendationResultResponse!.data);
    }
  }, [latestFSRecommendationResultPending, latestFSRecommendationResultResponse]);

  const [openPlanningCoursesModal, setOpenPlanningCoursesModal] = useState(false);
  const [openCompletedCoursesModal, setOpenCompletedCoursesModal] = useState(false);

  const handleGetRecommendation = async () => {
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

  const getCourseNameComponent = (
    courseDetail: CourseDetail,
    itemIdToItemSentiments: Record<string, FsItemSentiment[]>,
  ) => {
    return (
      <div className='flex gap-1 items-center'>
        <div className='line-clamp-1'>{courseDetail.course.name}</div>
        <Button
          type='text'
          onClick={(e) => {
            e.preventDefault();

            const sentimentRows = itemIdToItemSentiments[courseDetail.course.code].map(
              (fsItemSentiment) => ({
                key: fsItemSentiment.attribute,
                attribute: attributeValueToLabel(fsItemSentiment.attribute),
                score: Number(fsItemSentiment.sentimentScore.toFixed(2)),
              }),
            );

            modal.info({
              title: <div className='text-xl'>Điểm số các tiêu chí</div>,
              content: (
                <div>
                  <div className='text-gray-700'>
                    Bảng dưới đây hiển thị điểm cảm nhận trung bình của sinh viên cho từng tiêu chí
                    của môn học này.
                  </div>
                  <div className='my-2'></div>
                  <div className='text-gray-600'>
                    Thang điểm từ 1 đến 5. Điểm càng cao nghĩa là mức độ cảm nhận tích cực càng lớn.
                  </div>
                  <div className='my-3'></div>
                  <Table
                    size='small'
                    pagination={false}
                    dataSource={sentimentRows}
                    columns={[
                      {
                        title: 'Tiêu chí',
                        dataIndex: 'attribute',
                        key: 'attribute',
                      },
                      {
                        title: 'Điểm trung bình',
                        dataIndex: 'score',
                        key: 'score',
                        render: (value: number) => `${value.toFixed(2)} / 5`,
                      },
                    ]}
                  />
                </div>
              ),
              maskClosable: true,
              okText: 'Đóng',
            });
          }}
          shape='circle'
        >
          <QuestionCircleFilled className='text-primary text-xl' />
        </Button>
      </div>
    );
  };

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
              if (latestFSRecommendationResultPending) {
                return <Skeleton />;
              }
              if (!recommendationResult) {
                return (
                  <div className='flex flex-col h-ful'>
                    <Spin spinning={getFSRecommendationPending} className='h-full'>
                      <div className='flex items-center justify-center h-full'>
                        <Empty description='Chưa có kết quả gợi ý nào' />
                      </div>
                    </Spin>
                  </div>
                );
              }

              const topCourseDetail = recommendationResult.topCourseDetail;

              return (
                <div className='h-full overflow-y-auto overscroll-none'>
                  <Spin
                    spinning={
                      getRefinedFSRecommendationPending ||
                      getFSRecommendationPending ||
                      refetchingLatestFSRecommendationResult
                    }
                  >
                    <Card variant='borderless' className='border-2 border-primary'>
                      <Typography.Text className='flex items-center gap-3'>
                        <StarFilled className='text-yellow-500 text-3xl' />
                        <span className='mb-0 text-2xl font-bold'>Môn học phù hợp nhất</span>
                      </Typography.Text>
                      <div className='my-3'></div>
                      <div className='w-full'>
                        <RecommendedCourseCard
                          courseDetail={topCourseDetail}
                          courseName={getCourseNameComponent(
                            topCourseDetail,
                            recommendationResult.itemIdToItemSentiments,
                          )}
                          topRightBadge={
                            getEffectiveUserCourseStatus(topCourseDetail) ===
                            UserCourseStatus.COMPLETED ? (
                              <Tag variant='solid' color={'green'}>
                                Đã hoàn thành
                              </Tag>
                            ) : undefined
                          }
                          extra={
                            <CourseStatusButton
                              type={'plan'}
                              className='w-full'
                              marked={
                                getEffectiveUserCourseStatus(topCourseDetail) ===
                                UserCourseStatus.PLANNED
                              }
                              courseId={topCourseDetail.course.id}
                              onMarkChange={(marked) => {
                                setCourseStatusOverrides((prev) => ({
                                  ...prev,
                                  [topCourseDetail.course.code]: marked
                                    ? UserCourseStatus.PLANNED
                                    : undefined,
                                }));
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                              }}
                            />
                          }
                        />
                      </div>
                    </Card>
                    <div className='my-5'></div>
                    <div className='flex flex-col gap-5'>
                      {recommendationResult.categoryDetails.map((categoryDetail) => {
                        return (
                          <Card
                            variant='borderless'
                            key={JSON.stringify(categoryDetail)}
                            styles={{ body: { padding: 0 } }}
                          >
                            <div className='sticky top-0 z-20 bg-white px-6 py-4 rounded-t-lg'>
                              <Typography.Text strong className='text-xl m-0'>
                                {categoryDetail.category.map((tradeoffPair, idx) => {
                                  const isUp = isDirectionUp(tradeoffPair.direction);

                                  return (
                                    <span
                                      key={`${tradeoffPair.attribute}-${tradeoffPair.direction}`}
                                    >
                                      {idx > 0 && ', '}

                                      {/* ICON */}
                                      {isUp ? (
                                        <TrendingUp className='inline mr-2 text-green-500' />
                                      ) : (
                                        <TrendingDown className='inline mr-2 text-red-500' />
                                      )}

                                      {/* TEXT */}
                                      <span className='text-primary'>
                                        {attributeValueToLabel(tradeoffPair.attribute)}
                                      </span>

                                      {` ${isUp ? 'tốt hơn' : 'tệ hơn'}`}
                                    </span>
                                  );
                                })}

                                {/* RIGHT PART as inline text */}
                                <span className='text-gray-500 font-normal ml-2'>
                                  ({categoryDetail.courseDetails.length} môn)
                                </span>
                              </Typography.Text>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-1 gap-3 px-6 pb-6'>
                              {categoryDetail.courseDetails
                                // .slice(0, 10)
                                .map((courseDetail) => {
                                  return (
                                    <RecommendedCourseCard
                                      key={courseDetail.course.code}
                                      courseDetail={courseDetail}
                                      courseName={getCourseNameComponent(
                                        courseDetail,
                                        recommendationResult.itemIdToItemSentiments,
                                      )}
                                      topRightBadge={
                                        getEffectiveUserCourseStatus(courseDetail) ===
                                        UserCourseStatus.COMPLETED ? (
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
                                              getEffectiveUserCourseStatus(courseDetail) ===
                                              UserCourseStatus.PLANNED
                                            }
                                            courseId={courseDetail.course.id}
                                            onMarkChange={(marked) => {
                                              setCourseStatusOverrides((prev) => ({
                                                ...prev,
                                                [courseDetail.course.code]: marked
                                                  ? UserCourseStatus.PLANNED
                                                  : undefined,
                                              }));
                                            }}
                                            onClick={(e) => {
                                              e.preventDefault();
                                            }}
                                          />
                                          <div className='my-2'></div>
                                          <div className='flex gap-3'>
                                            <Space.Compact className='w-full'>
                                              <Button
                                                icon={<ArrowUpOutlined />}
                                                color='primary'
                                                variant='outlined'
                                                className='w-full'
                                                onClick={async (e) => {
                                                  e.preventDefault();

                                                  const result = (
                                                    await getRefinedFSRecommendation({
                                                      url: '/fs/recommendation/refined',
                                                      method: 'post',
                                                      data: {
                                                        recommendationId: recommendationResult.id,
                                                        itemId: courseDetail.course.code,
                                                        category: categoryDetail.category,
                                                      },
                                                    })
                                                  ).data;

                                                  setRecommendationResult(result);
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
                                                      <div className='space-y-3'>
                                                        <div className='text-gray-700'>
                                                          Khi chọn nút Tương tự, hệ thống sẽ ưu tiên
                                                          tìm các môn học gần các môn trong nhóm gợi
                                                          ý bạn đang xem.
                                                        </div>

                                                        <div className='rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-gray-700'>
                                                          <div className='font-semibold text-blue-700'>
                                                            Mẹo
                                                          </div>
                                                          <div>
                                                            Dùng tính năng này khi bạn thích môn
                                                            đang xem và muốn khám phá các lựa chọn
                                                            có trải nghiệm gần giống.
                                                          </div>
                                                        </div>

                                                        <div className='rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700'>
                                                          Kết quả mới sẽ thay thế danh sách hiện tại
                                                          để bạn tập trung vào nhóm môn học liên
                                                          quan nhất.
                                                        </div>
                                                      </div>
                                                    ),
                                                    okText: 'Đã hiểu',
                                                  });
                                                }}
                                              ></Button>
                                            </Space.Compact>
                                          </div>
                                        </div>
                                      }
                                    />
                                  );
                                })}
                            </div>
                          </Card>
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

      <Modal
        title='Môn học đã hoàn thành'
        open={openCompletedCoursesModal}
        onCancel={() => {
          setOpenCompletedCoursesModal(false);
        }}
        footer={null}
      >
        <Empty />
      </Modal>
      <Modal
        title='Môn dự kiến học'
        open={openPlanningCoursesModal}
        onCancel={() => {
          setOpenPlanningCoursesModal(false);
        }}
        footer={null}
      >
        <Empty />
      </Modal>
    </div>
  );
}
