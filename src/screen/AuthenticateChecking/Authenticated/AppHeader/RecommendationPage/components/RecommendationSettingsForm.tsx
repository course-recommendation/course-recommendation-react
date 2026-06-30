import RatingBox from '@/common/components/RatingBox';
import { StatsigEvent } from '@/common/constants/StatsigEvent.ts';
import { useLogStatsigEvent } from '@/common/hooks/useLogStatsigEvent.ts';
import { Attribute, Course } from '@/common/types/Course.types';
import { FilterCoursesOption } from '@/common/types/Recommendation.types';
import { RecommendationSettingsFormType } from '@/common/types/TriRank.types';
import {
  ProForm,
  ProFormCheckbox,
  ProFormDependency,
  ProFormItem,
  ProFormSelect,
} from '@ant-design/pro-components';
import { FormInstance } from 'antd/es/form';
import { useEffect, useRef } from 'react';

type Props = {
  form: FormInstance<RecommendationSettingsFormType>;
  attributes: Attribute[];
  allCourses: Course[];
  initialAttributeToScore?: Record<string, number>;
  initialFilterCoursesOptions: FilterCoursesOption[];
  initialCustomFilteredCourseCodes: string[];
};

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className='mb-4'>
      <div className='flex items-center gap-2.5'>
        <span className='inline-block w-1 h-5 rounded-full bg-indigo-600 shrink-0'></span>
        <span className='text-[15px] font-semibold text-[#1C1917] tracking-tight'>{title}</span>
      </div>
      {description && (
        <p className='mt-1.5 ml-[18px] text-[13px] text-gray-500 leading-relaxed'>{description}</p>
      )}
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
  const logEvent = useLogStatsigEvent();

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
          title='Điều chỉnh các tiêu chí'
          description='Điểm số càng cao nghĩa là bạn muốn tiêu chí đó có cảm nhận tích cực hơn.'
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
                    logEvent(StatsigEvent.AdjustPreference, value, {
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
          description='Loại bỏ các môn bạn không muốn xuất hiện trong kết quả gợi ý.'
        />
        <ProFormCheckbox.Group
          noStyle
          layout='vertical'
          name={'filterCoursesOptions'}
          fieldProps={{
            className: 'w-full',
            onChange: () => {
              logEvent(StatsigEvent.ClickFilterCoursesOption);
            },
          }}
          options={[
            {
              label: <span className='text-sm text-gray-700'>Lọc các môn đã lưu</span>,
              value: FilterCoursesOption.PLANNING,
            },
            {
              label: <span className='text-sm text-gray-700'>Lọc các môn đã hoàn thành</span>,
              value: FilterCoursesOption.COMPLETED,
            },
            {
              label: <span className='text-sm text-gray-700'>Tùy chỉnh</span>,
              value: FilterCoursesOption.CUSTOM,
            },
          ]}
        />
        <ProFormDependency name={['filterCoursesOptions']}>
          {({ filterCoursesOptions: _filterCoursesOptions }) => {
            const filterCoursesOptions = _filterCoursesOptions as FilterCoursesOption[] | undefined;
            if (!filterCoursesOptions?.includes(FilterCoursesOption.CUSTOM)) return null;

            return <CustomFilterSelect allCourses={allCourses} />;
          }}
        </ProFormDependency>
      </div>
    </ProForm>
  );
}

function CustomFilterSelect({ allCourses }: { allCourses: Course[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  return (
    <div className='mt-3' ref={ref}>
      <ProFormSelect
        name={'customFilteredCourseCodes'}
        label={<span className='text-sm font-medium text-gray-700'>Chọn các môn cần lọc</span>}
        mode='multiple'
        showSearch
        options={allCourses.map((course) => ({ label: course.name, value: course.code }))}
      />
    </div>
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
    <div className='flex flex-col gap-1.5 rounded-lg px-3 py-2.5 transition-colors duration-150 group'>
      <span className='text-sm text-gray-600  transition-colors duration-150 leading-snug'>
        {label}
      </span>
      <RatingBox highlightSmallerValues value={value} onChange={onChange} />
    </div>
  );
}
