import RatingBox from '@/common/components/RatingBox';
import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import { Attribute, Course } from '@/common/types/Course.types';
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
import useApp from 'antd/es/app/useApp';
import { FormInstance } from 'antd/es/form';

type Props = {
  form: FormInstance<RecommendationSettingsFormType>;
  attributes: Attribute[];
  allCourses: Course[];
  initialAttributeToScore?: Record<string, number>;
  initialFilterCoursesOptions: FilterCoursesOption[];
  initialCustomFilteredCourseCodes: string[];
};

function SectionHeading({ title, onHelp }: { title: string; onHelp: () => void }) {
  return (
    <div className='flex items-center gap-2.5 mb-4'>
      <span className='inline-block w-1 h-5 rounded-full bg-indigo-600 shrink-0'></span>
      <span className='text-[15px] font-semibold text-[#1C1917] tracking-tight'>{title}</span>
      <button
        type='button'
        onClick={onHelp}
        className='ml-auto text-gray-400 hover:text-indigo-600 transition-colors duration-150 leading-none'
      >
        <QuestionCircleOutlined />
      </button>
    </div>
  );
}

export default function RecommendationSettingsForm({
  form,
  attributes,
  allCourses,
  initialAttributeToScore,
  initialFilterCoursesOptions,
  initialCustomFilteredCourseCodes,
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
          attributes.map((attribute) => [
            attribute.value,
            initialAttributeToScore?.[attribute.value] ?? 3,
          ]),
        ),
        filterCoursesOptions: initialFilterCoursesOptions,
        customFilteredCourseCodes: initialCustomFilteredCourseCodes,
      }}
    >
      {/* Criteria section */}
      <div>
        <SectionHeading
          title='Tùy chỉnh tiêu chí'
          onHelp={() => {
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
                      hệ thống sẽ ưu tiên các môn mà sinh viên đánh giá tích cực hơn ở khía cạnh bài
                      tập về nhà (điều này có nghĩa là bài tập có thể dễ hơn, hoặc khối lượng ít
                      hơn,...).
                    </div>
                  </div>
                </div>
              ),
              okText: 'Đã hiểu',
            });
          }}
        />
        <div className='flex flex-col gap-1'>
          {attributes
            .sort((a, b) =>
              a.value.localeCompare(b.value, 'vi', {
                sensitivity: 'base',
              }),
            )
            .map((attribute) => (
              <ProFormItem key={attribute.id} name={['attributeToScore', attribute.value]} noStyle>
                <AttributeRow
                  label={attribute.value}
                  onChange={(value) => {
                    client.logEvent('adjust_preference', value, {
                      algorithm,
                      attribute: attribute.value,
                    });
                  }}
                />
              </ProFormItem>
            ))}
        </div>
      </div>

      {/* Divider between sections */}
      <div className='my-5 border-t border-stone-200' />

      {/* Filter section */}
      <div>
        <SectionHeading
          title='Lọc môn học'
          onHelp={() => {
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
                    Nếu chọn <span className='font-semibold'>Loại các môn tùy ý</span>, bạn có thể
                    chọn chính xác các mã môn muốn loại ở danh sách bên dưới.
                  </div>
                </div>
              ),
              okText: 'Đã hiểu',
            });
          }}
        />
        <ProFormCheckbox.Group
          noStyle
          layout='vertical'
          name={'filterCoursesOptions'}
          fieldProps={{
            className: 'w-full',
            onChange: () => {
              client.logEvent('click_filter_courses_option', undefined, { algorithm });
            },
          }}
          options={[
            {
              label: <span className='text-sm text-gray-700'>Loại các môn đang dự kiến học</span>,
              value: FilterCoursesOption.PLANNING,
            },
            {
              label: <span className='text-sm text-gray-700'>Loại các môn đã hoàn thành</span>,
              value: FilterCoursesOption.COMPLETED,
            },
            {
              label: <span className='text-sm text-gray-700'>Loại các môn tùy ý</span>,
              value: FilterCoursesOption.CUSTOM,
            },
          ]}
        />
        <ProFormDependency name={['filterCoursesOptions']}>
          {({ filterCoursesOptions: _filterCoursesOptions }) => {
            const filterCoursesOptions = _filterCoursesOptions as FilterCoursesOption[] | undefined;
            if (!filterCoursesOptions?.includes(FilterCoursesOption.CUSTOM)) return null;

            return (
              <div className='mt-3'>
                <ProFormSelect
                  name={'customFilteredCourseCodes'}
                  label={
                    <span className='text-sm font-medium text-gray-700'>Chọn các môn cần loại</span>
                  }
                  mode='multiple'
                  showSearch
                  options={allCourses.map((course) => ({ label: course.name, value: course.code }))}
                />
              </div>
            );
          }}
        </ProFormDependency>
      </div>
    </ProForm>
  );
}

function AttributeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange?: (value: number) => void;
}) {
  return (
    <div className='flex flex-col gap-1.5 rounded-lg px-3 py-2.5 hover:bg-indigo-50/60 transition-colors duration-150 group'>
      <span className='text-sm text-gray-600 group-hover:text-indigo-800 transition-colors duration-150 leading-snug'>
        {label}
      </span>
      <RatingBox highlightSmallerValues value={value} onChange={onChange} />
    </div>
  );
}
