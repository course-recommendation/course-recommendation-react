import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import { Algorithm, Attribute, Course, CourseDetail } from '@/common/types/Course.types';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Rate, Result, Select, Skeleton, Spin } from 'antd';
import useApp from 'antd/es/app/useApp';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

type SectionAttributeRating = {
  attributeId: number;
  score: number;
};

type FormSection = {
  key: string;
  courseId: number | null;
  attributeRatings: SectionAttributeRating[];
};

type SavedRatingSection = {
  courseId: number;
  courseCode: string;
  courseName: string;
  attributeRatings: { attributeId: number; attributeName: string; score: number }[];
};

type SavePayload = {
  sections: { courseId: number; attributeRatings: { attributeId: number; score: number }[] }[];
};

function makeEmptySection(key: string): FormSection {
  return { key, courseId: null, attributeRatings: [] };
}

function SectionCard({
  section,
  index,
  courses,
  attributes,
  selectedInOtherSections,
  onCourseChange,
  onScoreChange,
  onDelete,
  canDelete,
}: {
  section: FormSection;
  index: number;
  courses: Course[];
  attributes: Attribute[];
  selectedInOtherSections: number[];
  onCourseChange: (courseId: number | null) => void;
  onScoreChange: (attributeId: number, score: number) => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const getScore = (attributeId: number) =>
    section.attributeRatings.find((r) => r.attributeId === attributeId)?.score ?? 0;

  return (
    <Card
      className='rounded-2xl border border-stone-200'
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.03)' }}
      styles={{ body: { padding: '24px 28px' } }}
    >
      <div className='flex items-start justify-between gap-4 mb-5'>
        <div className='font-semibold text-[#1C1917] text-lg'>
          #{index + 1} -{' '}
          {section.courseId
            ? (courses.find((c) => c.id === section.courseId)?.name ?? 'Môn học')
            : 'Chưa chọn môn học'}
        </div>
        {canDelete && (
          <Button
            type='text'
            danger
            icon={<DeleteOutlined />}
            size='small'
            onClick={onDelete}
          >
            Xóa
          </Button>
        )}
      </div>

      <div className='mb-5'>
        <div className='text-sm font-medium text-gray-600 mb-1.5'>Môn học</div>
        <Select
          showSearch
          placeholder='Chọn môn học...'
          className='w-full'
          value={section.courseId}
          onChange={onCourseChange}
          filterOption={(input, option) =>
            (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={courses.map((c) => ({
            label: `${c.code} – ${c.name}`,
            value: c.id,
            disabled: selectedInOtherSections.includes(c.id),
          }))}
        />
      </div>

      {attributes.length > 0 && (
        <div className='flex flex-col gap-3'>
          <div className='text-sm font-medium text-gray-600 mb-1'>Đánh giá thuộc tính</div>
          {attributes.map((attr) => (
            <div
              key={attr.id}
              className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-stone-100 bg-[#FAF9F7] px-4 py-3'
            >
              <span className='text-[14px] font-medium text-[#1C1917]'>{attr.value}</span>
              <Rate
                className='text-3xl text-amber-500 shrink-0'
                value={getScore(attr.id)}
                onChange={(score) => onScoreChange(attr.id, score)}
                allowClear
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function CourseRatingPage() {
  const { message } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDone = searchParams.get('status') === 'done';
  const algorithm = useAlgorithmContext();

  const keyCounter = useRef(0);
  const nextKey = () => `section-${keyCounter.current++}`;

  const [sections, setSections] = useState<FormSection[]>([makeEmptySection(nextKey())]);
  const [initialized, setInitialized] = useState(false);

  const { data: courseDetailsResponse, isPending: coursesPending } = useGet<CourseDetail[]>(
    '/courses/detail',
    { params: { algorithm, name: '' } as { algorithm: Algorithm; name: string } },
  );
  const { data: attributesResponse, isPending: attributesPending } = useGet<Attribute[]>(
    '/attributes',
    { params: { algorithm } as { algorithm: Algorithm } },
  );
  const { data: savedResponse, isPending: savedPending } = useGet<SavedRatingSection[]>('/course-rating');

  const { request: save, isPending: saving } = useRequest<void, SavePayload>();

  useEffect(() => {
    if (savedPending || initialized) return;
    const saved = savedResponse?.data;
    if (saved && saved.length > 0) {
      setSections(
        saved.map((s) => ({
          key: nextKey(),
          courseId: s.courseId,
          attributeRatings: s.attributeRatings.map((r) => ({
            attributeId: r.attributeId,
            score: r.score,
          })),
        })),
      );
    }
    setInitialized(true);
  }, [savedPending, savedResponse, initialized]);

  const handleAddSection = () => {
    setSections((prev) => [...prev, makeEmptySection(nextKey())]);
  };

  const handleDeleteSection = (key: string) => {
    setSections((prev) => prev.filter((s) => s.key !== key));
  };

  const handleCourseChange = (key: string, courseId: number | null) => {
    setSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, courseId } : s)),
    );
  };

  const handleScoreChange = (key: string, attributeId: number, score: number) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.key !== key) return s;
        const existing = s.attributeRatings.find((r) => r.attributeId === attributeId);
        const updated = existing
          ? s.attributeRatings.map((r) =>
              r.attributeId === attributeId ? { ...r, score } : r,
            )
          : [...s.attributeRatings, { attributeId, score }];
        return { ...s, attributeRatings: updated };
      }),
    );
  };

  const handleSubmit = async () => {
    const invalid = sections.some((s) => s.courseId == null);
    if (invalid) {
      message.error('Vui lòng chọn môn học cho tất cả các mục');
      return;
    }

    try {
      await save({
        method: 'post',
        url: '/course-rating',
        data: {
          sections: sections.map((s) => ({
            courseId: s.courseId!,
            attributeRatings: s.attributeRatings,
          })),
        },
      });
      navigate('/course-rating?status=done');
    } catch {
      message.error('Không thể lưu đánh giá. Vui lòng thử lại.');
    }
  };

  if (isDone) {
    return (
      <div className='max-w-2xl mx-auto w-full py-16'>
        <Result
          status='success'
          title='Cảm ơn bạn đã hoàn thành khảo sát!'
          subTitle='Đánh giá của bạn đã được ghi nhận và sẽ giúp cải thiện hệ thống gợi ý môn học.'
          extra={[
            <Button key='edit' onClick={() => navigate('/course-rating')}>
              Chỉnh sửa đánh giá
            </Button>,
            <Button key='home' type='primary' onClick={() => navigate('/')}>
              Về trang chủ
            </Button>,
          ]}
        />
      </div>
    );
  }

  const courses: Course[] = (courseDetailsResponse?.data ?? []).map((cd) => cd.course);
  const isLoading = coursesPending || attributesPending || savedPending;

  return (
    <div className='max-w-2xl mx-auto w-full'>
      <div className='mb-8'>
        <h1
          className='text-[28px] font-semibold text-[#1C1917] leading-tight'
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Khảo sát đánh giá môn học
        </h1>
        <div className='mt-2 w-8 h-[3px] rounded-full bg-indigo-700' />
      </div>

      <div className='mb-6 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4'>
        <p className='text-indigo-800 text-[14px] leading-[1.7]'>
          Đánh giá mỗi thuộc tính của môn học theo thang điểm từ 1-5. Điểm càng cao tức là cảm nhận của bạn về thuộc tính đó càng tích cực
        </p>
      </div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <Spin spinning={saving}>
          <div className='flex flex-col gap-5'>
            {sections.map((section, index) => (
              <SectionCard
                key={section.key}
                section={section}
                index={index}
                courses={courses}
                selectedInOtherSections={sections
                  .filter((s) => s.key !== section.key && s.courseId != null)
                  .map((s) => s.courseId as number)}
                attributes={attributesResponse?.data ?? []}
                onCourseChange={(courseId) => handleCourseChange(section.key, courseId)}
                onScoreChange={(attributeId, score) =>
                  handleScoreChange(section.key, attributeId, score)
                }
                onDelete={() => handleDeleteSection(section.key)}
                canDelete={sections.length > 1}
              />
            ))}
          </div>

          <div className='mt-5'>
            <Button
              type='dashed'
              size='large'
              icon={<PlusOutlined />}
              className='w-full'
              onClick={handleAddSection}
            >
              Thêm môn học
            </Button>
          </div>

          <div className='mt-8 flex justify-end'>
            <Button
              type='primary'
              size='large'
              className='w-full md:w-auto px-8'
              loading={saving}
              onClick={handleSubmit}
            >
              Gửi đánh giá
            </Button>
          </div>
        </Spin>
      )}
    </div>
  );
}
