import RatingBox from '@/common/components/RatingBox';
import { StatsigEvent } from '@/common/constants/StatsigEvent.ts';
import { useLogStatsigEvent } from '@/common/hooks/useLogStatsigEvent.ts';
import { Attribute, Course } from '@/common/types/Course.types';
import { FilterCoursesOption } from '@/common/types/Recommendation.types';
import { RecommendationSettingsFormType } from '@/common/types/TriRank.types';
import { QuestionCircleOutlined, UpOutlined } from '@ant-design/icons';
import { ProForm, ProFormCheckbox, ProFormItem, ProFormSelect } from '@ant-design/pro-components';
import { Form, Modal } from 'antd';
import { FormInstance } from 'antd/es/form';
import { useState } from 'react';

type Props = {
  form: FormInstance<RecommendationSettingsFormType>;
  attributes: Attribute[];
  allCourses: Course[];
  initialAttributeToScore?: Record<string, number>;
  initialFilterCoursesOptions: FilterCoursesOption[];
  initialCustomFilteredCourseCodes: string[];
};

function SectionHeading({
  title,
  description,
  onHelpClick,
}: {
  title: string;
  description?: string;
  onHelpClick?: () => void;
}) {
  return (
    <div className='mb-4'>
      <div className='flex items-center gap-2.5'>
        <span className='inline-block w-1 h-5 rounded-full bg-indigo-600 shrink-0'></span>
        <span className='text-[15px] font-semibold text-[#1C1917] tracking-tight'>{title}</span>
        {onHelpClick && (
          <button
            type='button'
            onClick={onHelpClick}
            className='flex items-center justify-center text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors duration-150'
            aria-label='Giải thích về mục này'
          >
            <QuestionCircleOutlined className='text-sm' />
          </button>
        )}
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
  const [filterSectionExpanded, setFilterSectionExpanded] = useState(false);
  const [preferenceHelpOpen, setPreferenceHelpOpen] = useState(false);

  const watchedFilterCoursesOptions = Form.useWatch('filterCoursesOptions', form);
  const watchedCustomFilteredCourseCodes = Form.useWatch('customFilteredCourseCodes', form);
  const activeFilterCount =
    (watchedFilterCoursesOptions ?? initialFilterCoursesOptions).length +
    (watchedCustomFilteredCourseCodes ?? initialCustomFilteredCourseCodes).length;

  return (
    <>
      <ProForm<RecommendationSettingsFormType>
        form={form}
        submitter={false}
        className='flex-1 min-h-0 flex flex-col'
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
        <div className='flex-1 min-h-[96px] overflow-y-auto pr-1'>
          <SectionHeading
            title='Điều chỉnh sở thích của bạn'
            description='Điểm số càng cao nghĩa là bạn muốn tiêu chí đó càng tích cực trong các môn được gợi ý.'
            onHelpClick={() => setPreferenceHelpOpen(true)}
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
        <div className='my-5 border-t border-stone-200 shrink-0' />

        {/* Filter section */}
        <div className='shrink min-h-0 overflow-y-auto pr-1 -mb-5'>
          <button
            type='button'
            onClick={() => setFilterSectionExpanded((expanded) => !expanded)}
            className='w-full flex items-center justify-between gap-2 mb-4 group'
          >
            <div className='flex items-center gap-2.5 min-w-0'>
              <span className='inline-block w-1 h-5 rounded-full bg-indigo-600 shrink-0'></span>
              <span className='text-[15px] font-semibold text-[#1C1917] tracking-tight'>
                Lọc môn học
              </span>
              {!filterSectionExpanded && activeFilterCount > 0 && (
                <span className='inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-semibold shrink-0'>
                  {activeFilterCount}
                </span>
              )}
            </div>
            <UpOutlined
              className={`text-gray-400 text-xs shrink-0 transition-transform duration-200 ease-out group-hover:text-gray-600 ${
                filterSectionExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
              filterSectionExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className='overflow-hidden'>
              <p className='mb-4 ml-[18px] text-[13px] text-gray-500 leading-relaxed'>
                Loại bỏ các môn bạn không muốn xuất hiện trong kết quả gợi ý.
              </p>
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
                ]}
              />
              <CustomFilterSelect allCourses={allCourses} />
            </div>
          </div>
        </div>
      </ProForm>
      <Modal
        title='Điều chỉnh sở thích của bạn'
        open={preferenceHelpOpen}
        onCancel={() => setPreferenceHelpOpen(false)}
        onOk={() => setPreferenceHelpOpen(false)}
        cancelButtonProps={{ style: { display: 'none' } }}
        okText='Đã hiểu'
      >
        <div className='text-sm text-gray-600 leading-relaxed space-y-3'>
          <p>
            Mỗi tiêu chí của một môn học đều được chấm điểm từ <strong>1 đến 5</strong>, dựa trên
            đánh giá thực tế của những sinh viên đã học môn đó.
          </p>
          <p>
            Khi bạn điều chỉnh sở thích bên dưới, hệ thống sẽ ưu tiên gợi ý những môn có điểm số ở
            các tiêu chí này <strong>càng gần với điểm mục tiêu bạn chọn càng tốt</strong>.
          </p>
          <p>
            Nhờ vậy, bạn có thể tự do khám phá nhiều môn học theo đúng tiêu chí mình quan tâm trước
            khi đưa ra quyết định cuối cùng, thay vì chỉ nhận được những môn mà hệ thống cho là phù
            hợp nhất mà không thể tự điều chỉnh kết quả theo ý mình.
          </p>
        </div>
      </Modal>
    </>
  );
}

function CustomFilterSelect({ allCourses }: { allCourses: Course[] }) {
  return (
    <div className='mt-3'>
      <ProFormSelect
        name={'customFilteredCourseCodes'}
        label={<span className='text-sm font-medium text-gray-700'>Các môn không quan tâm</span>}
        mode='multiple'
        showSearch
        fieldProps={{ maxTagCount: 'responsive' }}
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
