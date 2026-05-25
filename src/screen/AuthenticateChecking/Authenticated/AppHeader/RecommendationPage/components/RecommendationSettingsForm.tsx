import RatingBox from '@/common/components/RatingBox';
import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import { Course } from '@/common/types/Course.types';
import { FilterCoursesOption } from '@/common/types/Recommendation.types';
import { RecommendationSettingsFormType } from '@/common/types/TriRank.types';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  ProForm,
  ProFormCheckbox,
  ProFormDependency,
  ProFormItem,
  ProFormSelect,
} from '@ant-design/pro-components';
import { useStatsigClient } from '@statsig/react-bindings';
import { Divider } from 'antd';
import useApp from 'antd/es/app/useApp';
import { FormInstance } from 'antd/es/form';

type Props = {
  form: FormInstance<RecommendationSettingsFormType>;
  attributes: string[];
  allCourses: Course[];
  initialAttributeToScore?: Record<string, number>;
  initialFilterCoursesOptions: FilterCoursesOption[];
  initialCustomFilteredCourseCodes: string[];
  attributeValueToLabel: (value: string) => string;
};

export default function RecommendationSettingsForm({
  form,
  attributes,
  allCourses,
  initialAttributeToScore,
  initialFilterCoursesOptions,
  initialCustomFilteredCourseCodes,
  attributeValueToLabel,
}: Props) {
  const { modal } = useApp();
  const algorithm = useAlgorithmContext();
  const { client } = useStatsigClient();

  return (
    <ProForm<RecommendationSettingsFormType>
      form={form}
      submitter={false}
      initialValues={{
        attributeToScore: Object.fromEntries(
          attributes.map((attribute) => [attribute, initialAttributeToScore?.[attribute] ?? 3]),
        ),
        filterCoursesOptions: initialFilterCoursesOptions,
        customFilteredCourseCodes: initialCustomFilteredCourseCodes,
      }}
    >
      <div className='flex gap-2'>
        <div className='font-bold text-2xl'>Lọc môn học</div>
        <QuestionCircleOutlined
          onClick={() => {
            modal.info({
              title: <div className='text-xl font-semibold'>Hướng dẫn lọc môn học</div>,
              content: (
                <div className='space-y-3'>
                  <div className='text-gray-700'>
                    Phần này giúp bạn loại bỏ các môn không muốn xuất hiện trong kết quả gợi ý để
                    danh sách phù hợp hơn với nhu cầu hiện tại.
                  </div>

                  <div className='rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-gray-700'>
                    <div className='font-semibold text-blue-700'>Cách dùng nhanh</div>
                    <div>
                      Chọn một hoặc nhiều tùy chọn bên dưới. Hệ thống sẽ tự động loại các môn tương
                      ứng trước khi tính toán gợi ý.
                    </div>
                  </div>

                  <div className='rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700'>
                    Nếu chọn <span className='font-semibold'>Bỏ những môn học tùy chỉnh</span>, bạn
                    có thể chọn chính xác các mã môn muốn loại ở danh sách bên dưới.
                  </div>
                </div>
              ),
              okText: 'Đã hiểu',
            });
          }}
        />
      </div>
      <div className='my-3'></div>
      <ProFormCheckbox.Group
        noStyle
        layout='vertical'
        name={'filterCoursesOptions'}
        fieldProps={{
          className: 'flex flex-col gap-3',
          onChange: () => {
            client.logEvent('click_filter_courses_option', undefined, { algorithm });
          },
        }}
        options={[
          {
            label: <div className='font-medium text-gray-800'>Loại các môn đang dự kiến học</div>,
            value: FilterCoursesOption.PLANNING,
          },
          {
            label: <div className='font-medium text-gray-800'>Loại các môn đã hoàn thành</div>,
            value: FilterCoursesOption.COMPLETED,
          },
          {
            label: <div className='font-medium text-gray-800'>Loại các môn tự chọn</div>,
            value: FilterCoursesOption.CUSTOM,
          },
        ]}
      />
      <div className='my-3'></div>
      <ProFormDependency name={['filterCoursesOptions']}>
        {({ filterCoursesOptions: _filterCoursesOptions }) => {
          const filterCoursesOptions = _filterCoursesOptions as FilterCoursesOption[] | undefined;

          return (
            <ProFormSelect
              name={'customFilteredCourseCodes'}
              label={<div className='font-medium text-gray-800'>Chọn các môn cần loại</div>}
              mode='multiple'
              showSearch
              hidden={!filterCoursesOptions?.includes(FilterCoursesOption.CUSTOM)}
              options={allCourses.map((course) => ({ label: course.name, value: course.code }))}
            />
          );
        }}
      </ProFormDependency>
      <Divider />

      <div>
        <div className='flex gap-2'>
          <div className='font-bold text-2xl'>Tùy chỉnh tiêu chí</div>
          <QuestionCircleOutlined
            onClick={() => {
              modal.info({
                title: <div className='text-xl font-semibold'>Hướng dẫn tùy chỉnh tiêu chí</div>,
                content: (
                  <div className='space-y-3'>
                    <div className='text-gray-700'>
                      Bạn đang thiết lập mức độ mong muốn cho từng tiêu chí của môn học. Hệ thống sẽ
                      ưu tiên gợi ý các môn có điểm cảm nhận gần với các mức bạn chọn.
                    </div>

                    <div className='rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-gray-700'>
                      <span className='font-semibold text-blue-700'>Cách hiểu nhanh:</span> Chỉ số
                      càng cao nghĩa là bạn muốn tiêu chí đó có cảm nhận tích cực hơn.
                    </div>

                    <div className='rounded-lg border border-gray-200 bg-gray-50 px-3 py-2'>
                      <div className='font-semibold text-gray-800 mb-1'>Ví dụ</div>
                      <div className='text-gray-700'>
                        Nếu bạn tăng chỉ số <span className='font-semibold'>"Bài tập về nhà"</span>,
                        hệ thống sẽ ưu tiên các môn mà sinh viên đánh giá tích cực hơn ở khía cạnh
                        bài tập về nhà (điều này có nghĩa là bài tập có thể dễ hơn, hoặc khối lượng
                        ít hơn,...).
                      </div>
                    </div>
                  </div>
                ),
                okText: 'Đã hiểu',
              });
            }}
          />
        </div>
        <div className='my-3'></div>
        {attributes
          .sort((a, b) =>
            attributeValueToLabel(a).localeCompare(attributeValueToLabel(b), 'vi', {
              sensitivity: 'base',
            }),
          )
          .map((attribute) => (
            <ProFormItem
              key={attribute}
              name={['attributeToScore', attribute]}
              label={
                <div className='font-semibold text-gray-600'>
                  {attributeValueToLabel(attribute)}
                </div>
              }
              className='pl-2'
              layout='vertical'
            >
              <RatingBox
                highlightSmallerValues
                onChange={async (value) => {
                  client.logEvent('adjust_preference', value, { algorithm, attribute });
                }}
              />
            </ProFormItem>
          ))}
      </div>
    </ProForm>
  );
}
