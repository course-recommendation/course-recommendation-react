import TrendingDown from '@/assets/icons/TrendingDown';
import TrendingUp from '@/assets/icons/TrendingUp';
import RatingBox from '@/common/components/RatingBox';
import RecommendedCourseCard from '@/common/components/RecommendedCourseCard';
import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import { useBreakpoint } from '@/common/hooks/useBreakpoint';
import { Algorithm, Course, Dataset } from '@/common/types/Course.types';
import {
  FSRecommendationRequest,
  FSRecommendationResult,
  FSRefinedRecommendationRequest,
  isDirectionUp,
} from '@/common/types/FS.types';
import { FilterCoursesOption } from '@/common/types/Recommendation.types';
import { ArrowUpOutlined, SettingOutlined, StarFilled } from '@ant-design/icons';
import {
  ProForm,
  ProFormCheckbox,
  ProFormDependency,
  ProFormItem,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Button, Card, Divider, Drawer, Empty, Modal, Skeleton, Spin, Typography } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect, useState } from 'react';
import { useAttributeValueToLabel } from './hooks/useAttributeValueToLabel';

type RecommendationSettingFormType = {
  attributeToTargetSentimentScore: Record<string, number>;
  filterCoursesOptions?: FilterCoursesOption[];
  customFilteredCourseCodes?: string[];
};

type Props = {
  dataset: Dataset;
};

export default function FSRecommendation({ dataset }: Props) {
  const attributeValueToLabel = useAttributeValueToLabel();

  const isDesktop = useBreakpoint('md');

  const { data: allCoursesResponse } = useGet<Course[]>(`/courses`, {
    params: {
      domain: {
        dataset,
        algorithm: Algorithm.FS,
      },
    },
  });

  const [form] = useForm<RecommendationSettingFormType>();
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

  const { data: attributesResponse, isPending: attributesPending } = useGet<string[]>(
    `/attributes`,
    {
      params: {
        dataset,
        algorithm: Algorithm.FS,
      },
    },
  );

  const { data: attributeToScoreResponse, isPending: attributeToScorePending } = useGet<
    Record<string, number> | undefined
  >(`/user-preference`, {
    params: {
      dataset,
      algorithm: Algorithm.FS,
    },
  });

  const {
    data: latestFSRecommendationResultResponse,
    isPending: latestFSRecommendationResultPending,
    isRefetching: refetchingLatestFSRecommendationResult,
  } = useGet<FSRecommendationResult | undefined>(`/fs/latest-recommendation`, {
    params: {
      dataset,
    },
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

  useEffect(() => {
    if (!latestFSRecommendationResultPending) {
      // TODO: find the correct way to do
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
          dataset,
          attributeToPreferenceConfigure: Object.fromEntries(
            Object.entries(formValues.attributeToTargetSentimentScore).map(([key, value]) => [
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

  const settingsForm = (
    <div>
      {(() => {
        if (attributesPending || attributeToScorePending || latestFSRecommendationResultPending) {
          return <Skeleton active />;
        }

        const attributes = attributesResponse!.data;
        const attributeToTargetSentimentScore = attributeToScoreResponse!.data;
        const latestFSRecommendationResult = latestFSRecommendationResultResponse!.data;

        return (
          <ProForm<RecommendationSettingFormType>
            form={form}
            submitter={false}
            initialValues={{
              attributeToTargetSentimentScore: Object.fromEntries(
                attributes.map((attribute) => [
                  attribute,
                  attributeToTargetSentimentScore?.[attribute] ?? 3,
                ]),
              ),
              filterCoursesOptions: latestFSRecommendationResult?.filterCoursesOptions ?? [],
              customFilteredCourseCodes:
                latestFSRecommendationResult?.customFilteredCourseCodes ?? [],
            }}
          >
            <div className='font-bold text-2xl'>Lọc môn học</div>
            <div className='my-3'></div>
            <ProFormCheckbox.Group
              noStyle
              layout='vertical'
              name={'filterCoursesOptions'}
              options={[
                {
                  label: <div className='font-medium text-gray-800'>Bỏ những môn dự kiến học</div>,
                  value: FilterCoursesOption.PLANNING,
                },
                {
                  label: (
                    <div className='font-medium text-gray-800'>Bỏ những môn đã hoàn thành</div>
                  ),
                  value: FilterCoursesOption.COMPLETED,
                },
                {
                  label: (
                    <div className='font-medium text-gray-800'>Bỏ những môn học tùy chỉnh</div>
                  ),
                  value: FilterCoursesOption.CUSTOM,
                },
              ]}
            />
            <div className='my-3'></div>
            <ProFormDependency name={['filterCoursesOptions']}>
              {({ filterCoursesOptions: _filterCoursesOptions }) => {
                const filterCoursesOptions = _filterCoursesOptions as
                  | FilterCoursesOption[]
                  | undefined;
                return (
                  <ProFormSelect
                    name={'customFilteredCourseCodes'}
                    label={<div className='font-medium text-gray-800'>Chọn môn học để bỏ</div>}
                    mode='multiple'
                    showSearch
                    hidden={!filterCoursesOptions?.includes(FilterCoursesOption.CUSTOM)}
                    options={
                      allCoursesResponse?.data.map((course) => {
                        return {
                          label: course.name,
                          value: course.code,
                        };
                      }) ?? []
                    }
                    fieldProps={{
                      maxTagCount: 'responsive',
                    }}
                  />
                );
              }}
            </ProFormDependency>
            <Divider />

            <div>
              <div className='font-bold text-2xl'>Điều chỉnh chỉ số</div>
              <div className='my-3'></div>
              {attributes.map((attribute) => (
                <ProFormItem
                  key={attribute}
                  name={['attributeToTargetSentimentScore', attribute]}
                  label={
                    <div className='font-semibold text-gray-600'>
                      {attributeValueToLabel(attribute)}
                    </div>
                  }
                  className='pl-2'
                  layout='vertical'
                >
                  <RatingBox highlightSmallerValues />
                </ProFormItem>
              ))}
            </div>
          </ProForm>
        );
      })()}
    </div>
  );

  return (
    <div className='flex flex-col md:flex-row md:items-center h-full'>
      <div className='w-full h-full flex flex-col md:flex-row gap-4 md:gap-8'>
        <Card
          variant='borderless'
          className='hidden md:flex md:w-[400px] flex-col gap-3 md:shrink-0'
          styles={{
            body: {
              overflow: 'hidden',
            },
          }}
        >
          <div className='flex flex-col h-full gap-5'>
            <div className='flex-1 overflow-auto overscroll-none'>{isDesktop && settingsForm}</div>
            {recommendButton}
          </div>
        </Card>

        <Button
          className='md:hidden w-full'
          type='primary'
          icon={<SettingOutlined />}
          onClick={() => setSettingsDrawerOpen(true)}
          size='large'
        >
          Cài đặt gợi ý
        </Button>

        <Drawer
          title='Cài đặt gợi ý'
          placement='bottom'
          onClose={() => setSettingsDrawerOpen(false)}
          open={settingsDrawerOpen}
          size={'large'}
          className='md:hidden'
        >
          {settingsForm}
          <div className='my-5'></div>
          {recommendButton}
        </Drawer>

        <div className='h-full flex flex-col overflow-hidden'>
          <div className='font-bold text-[26px] shrink-0'>Gợi ý môn học</div>
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
                          courseDetail={recommendationResult.topCourseDetail}
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
                            <div className='sticky top-0 z-10 bg-white px-6 py-4 rounded-t-lg'>
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
                                      extra={
                                        <Button
                                          icon={<ArrowUpOutlined />}
                                          type='primary'
                                          onClick={async (e) => {
                                            e.preventDefault();

                                            const result = (
                                              await getRefinedFSRecommendation({
                                                url: '/fs/recommendation/refined',
                                                method: 'post',
                                                data: {
                                                  dataset,
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
