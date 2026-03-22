import CourseCard from '@/common/components/CourseCard';
import { Measure } from '@/common/constants/Measure';
import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import { useBreakpoint } from '@/common/hooks/useBreakpoint';
import {
  Algorithm,
  Course,
  CourseDetail,
  Dataset,
  UserCourseStatus,
} from '@/common/types/Course.types';
import {
  FSRecommendationRequest,
  FSRecommendationResult,
  FSRefinedRecommendationRequest,
  isDirectionUp,
} from '@/common/types/FS.types';
import { FilterCoursesOption } from '@/common/types/Recommendation.types';
import {
  ArrowUpOutlined,
  CommentOutlined,
  DeleteOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  ProForm,
  ProFormCheckbox,
  ProFormDependency,
  ProFormItem,
  ProFormSelect,
} from '@ant-design/pro-components';
import {
  Button,
  Card,
  Collapse,
  Divider,
  Drawer,
  Empty,
  Modal,
  Skeleton,
  Slider,
  Spin,
  Tooltip,
  Typography,
} from 'antd';
import useApp from 'antd/es/app/useApp';
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
  const { message } = useApp();
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
    refetch: refetchLatestFSRecommendationResult,
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

  const { request: updateUserCourse } = useRequest<
    void,
    { courseId: number; status: UserCourseStatus }
  >();
  const [addingOrRemovingCourseId, setAddingOrRemovingCourseId] = useState<string | undefined>(
    undefined,
  );

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

  const getAddOrRemoveButton = (courseDetail: CourseDetail) => {
    const addedToPlanningCourses = courseDetail.userCourseStatuses.includes(
      UserCourseStatus.PLANNING,
    );
    return (
      <Tooltip
        title={
          addedToPlanningCourses
            ? 'Xóa khỏi danh sách những môn dự kiến học'
            : 'Thêm vào danh sách những môn dự kiến học'
        }
      >
        <Button
          className='w-full'
          type={addedToPlanningCourses ? 'default' : 'primary'}
          loading={addingOrRemovingCourseId === courseDetail.course.code}
          icon={addedToPlanningCourses ? <DeleteOutlined /> : <PlusOutlined />}
          onClick={async (e) => {
            e.preventDefault();

            setAddingOrRemovingCourseId(courseDetail.course.code);
            if (addedToPlanningCourses) {
              await updateUserCourse({
                method: 'delete',
                url: `/me/courses/${courseDetail.course.id}`,
              });
            } else {
              await updateUserCourse({
                method: 'post',
                url: '/me/courses',
                data: {
                  courseId: courseDetail.course.id,
                  status: UserCourseStatus.PLANNING,
                },
              });
            }
            setAddingOrRemovingCourseId(undefined);

            const successMessage = addedToPlanningCourses
              ? 'Xóa khỏi môn học dự kiến thành công'
              : 'Thêm vào môn học dự kiến thành công';
            message.success(successMessage);

            refetchLatestFSRecommendationResult();
          }}
        >
          {addedToPlanningCourses ? 'Xóa' : 'Thêm'}
        </Button>
      </Tooltip>
    );
  };

  const getViewDiscussionsButton = (courseId: string) => {
    return (
      <Tooltip title='Xem những thảo luận về môn này'>
        {/* TODO: remove this key */}
        <Button key={courseId}>
          <CommentOutlined />
        </Button>
      </Tooltip>
    );
  };

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

  const settingsForm = (
    <div className='h-full flex flex-col overflow-hidden'>
      <div className='flex-1 overflow-y-auto min-h-0'>
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
              layout='horizontal'
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
              <Card title={'Lọc môn học'}>
                <ProFormCheckbox.Group
                  noStyle
                  name={'filterCoursesOptions'}
                  options={[
                    {
                      label: 'Những môn dự kiến học',
                      value: FilterCoursesOption.PLANNING,
                    },
                    {
                      label: 'Những môn đã hoàn thành',
                      value: FilterCoursesOption.COMPLETED,
                    },
                    { label: 'Tùy chỉnh', value: FilterCoursesOption.CUSTOM },
                  ]}
                  fieldProps={{
                    onChange: (checkedValues) => {
                      if (!checkedValues.includes(FilterCoursesOption.CUSTOM)) {
                        form.setFieldValue('customFilteredCourseCodes', []);
                      }
                    },
                  }}
                />
                <ProFormDependency name={['filterCoursesOptions']}>
                  {({ filterCoursesOptions: _filterCoursesOptions }) => {
                    const filterCoursesOptions = _filterCoursesOptions as
                      | FilterCoursesOption[]
                      | undefined;
                    return (
                      <ProFormSelect
                        name={'customFilteredCourseCodes'}
                        mode='multiple'
                        showSearch
                        disabled={!filterCoursesOptions?.includes(FilterCoursesOption.CUSTOM)}
                        options={
                          allCoursesResponse?.data.map((course) => {
                            return {
                              label: course.name,
                              value: course.code,
                            };
                          }) ?? []
                        }
                      />
                    );
                  }}
                </ProFormDependency>
              </Card>
              <div className='my-3'></div>
              <Card title={'Điều chỉnh chỉ số'}>
                {attributes.map((attribute) => (
                  <ProFormItem
                    key={attribute}
                    name={['attributeToTargetSentimentScore', attribute]}
                    label={attributeValueToLabel(attribute)}
                    className='pl-2'
                  >
                    <Slider
                      min={1}
                      max={5}
                      marks={{
                        1: '1',
                        2: '2',
                        3: '3',
                        4: '4',
                        5: '5',
                      }}
                      dots
                      className='w-[90%]'
                    />
                  </ProFormItem>
                ))}
              </Card>
            </ProForm>
          );
        })()}
      </div>

      <div className='shrink-0 mt-4'>
        <Button
          className='w-full'
          type='primary'
          loading={getFSRecommendationPending}
          onClick={handleGetRecommendation}
        >
          Xem kết quả
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className='flex flex-col md:flex-row md:items-center p-4 md:p-0'
      style={{ height: Measure.SCREEN_HEIGHT_STYLE }}
    >
      <div className='w-full h-full flex flex-col md:flex-row gap-4 md:gap-5 md:px-20 md:h-[85%]'>
        <div className='hidden md:flex md:w-[400px] flex-col gap-3 border border-gray-200 rounded-2xl bg-white p-7 overflow-hidden'>
          <div className='shrink-0'>
            <Typography.Title level={4} className='m-0'>
              Cài đặt gợi ý
            </Typography.Title>
          </div>
          {isDesktop && settingsForm}
        </div>

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
        </Drawer>

        <div className='w-full border border-gray-200 rounded-2xl bg-white p-4 md:p-5 flex-1 overflow-hidden'>
          {(() => {
            if (latestFSRecommendationResultPending) {
              return <Skeleton />;
            }
            if (!recommendationResult) {
              return (
                <div className='flex flex-col h-full justify-center'>
                  <Spin spinning={getFSRecommendationPending}>
                    <Empty description='Chưa có kết quả gợi ý nào' />
                  </Spin>
                </div>
              );
            }

            return (
              <div className='h-full overflow-y-auto'>
                <Spin
                  spinning={
                    getRefinedFSRecommendationPending ||
                    getFSRecommendationPending ||
                    refetchingLatestFSRecommendationResult
                  }
                >
                  <Typography.Title level={5} className='text-lg md:text-xl'>
                    Môn học phù hợp với bạn nhất là:
                  </Typography.Title>
                  <div className='w-full md:w-1/3'>
                    <CourseCard
                      courseDetail={recommendationResult.topCourseDetail}
                      footer={
                        <div className='flex gap-2'>
                          {getAddOrRemoveButton(recommendationResult.topCourseDetail)}
                          {getViewDiscussionsButton(
                            recommendationResult.topCourseDetail.course.code,
                          )}
                        </div>
                      }
                    />
                  </div>
                  <Divider className='border-gray-400' />
                  <div className='my-4 md:my-5'></div>
                  <Typography.Title level={5} className='text-ls md:text-xl'>
                    Ngoài ra hệ thống cũng gợi ý một số môn học khác cho bạn kèm theo lý do như bên
                    dưới:
                  </Typography.Title>
                  <Collapse
                    items={recommendationResult.categoryDetails.map((categoryDetail, index) => {
                      return {
                        key: JSON.stringify(categoryDetail),
                        label: (
                          <Typography.Text strong>
                            {`Nhóm ${index + 1}: `}
                            {categoryDetail.category.map((tradeoffPair, idx) => (
                              <span key={idx}>
                                {idx > 0 && ', '}
                                <span className='text-primary'>
                                  {attributeValueToLabel(tradeoffPair.attribute) ||
                                    tradeoffPair.attribute}
                                </span>
                                {` ${isDirectionUp(tradeoffPair.direction) ? 'tốt hơn' : 'tệ hơn'}`}
                              </span>
                            ))}
                          </Typography.Text>
                        ),
                        children: (
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-3'>
                            {categoryDetail.courseDetails.slice(0, 10).map((courseDetail) => {
                              return (
                                <CourseCard
                                  key={courseDetail.course.id}
                                  courseDetail={courseDetail}
                                  footer={
                                    <div className='flex flex-col md:flex-row gap-2'>
                                      {getAddOrRemoveButton(courseDetail)}
                                      <Tooltip title='Gợi ý những môn học tương tự nhóm này nhưng chất lượng tốt hơn'>
                                        <Button
                                          className='w-full'
                                          icon={<ArrowUpOutlined />}
                                          onClick={async (e) => {
                                            e.preventDefault();

                                            const resullt = (
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

                                            setRecommendationResult(resullt);
                                          }}
                                        >
                                          Tốt hơn
                                        </Button>
                                      </Tooltip>
                                      {getViewDiscussionsButton(courseDetail.course.code)}
                                    </div>
                                  }
                                />
                              );
                            })}
                          </div>
                        ),
                      };
                    })}
                  />
                </Spin>
              </div>
            );
          })()}
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
