import SatisfactionRating from '@/common/components/SatisfactionRating';
import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import { useAttributeValues } from '@/common/hooks/useAttributeValues';
import {
  Algorithm,
  CourseDetail,
  GetCourseDetailsRequest,
  RateCourseRequest,
  RateCourseSatisfactionRequest,
} from '@/common/types/Course.types';
import AttributeRating from '@/screen/AuthenticateChecking/Authenticated/AppHeader/CourseDetailPage/AttributeRating';
import { StarOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import { useState } from 'react';

type Props = {
  courseId: number;
  courseCode: string;
  algorithm: Algorithm;
};

export default function RatingPopoverCard({ courseId, courseCode, algorithm }: Props) {
  const { data: attributeValuesResponse, isPending: attributesPending } = useAttributeValues({
    algorithm,
  });
  const { data: courseDetailResponse, isPending: courseDetailPending } = useGet<CourseDetail>(
    `/courses/${courseCode}/detail`,
    { params: { algorithm } as GetCourseDetailsRequest },
  );
  const { request: rateCourse } = useRequest<void, RateCourseRequest>();
  const { request: rateSatisfaction } = useRequest<void, RateCourseSatisfactionRequest>();
  const [satisfactionOverride, setSatisfactionOverride] = useState<number | undefined>(undefined);

  if (attributesPending || courseDetailPending) {
    return (
      <div style={{ width: 360 }}>
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>
    );
  }

  const attributes = attributeValuesResponse!.data;
  const courseDetail = courseDetailResponse!.data;
  const ratings = courseDetail.userAttributeIdToRatingScore;
  const satisfaction = satisfactionOverride ?? courseDetail.userSatisfactionScore;

  return (
    <div style={{ width: 380, maxHeight: 480, overflowY: 'auto', padding: '8px 4px' }}>
      <div className='mb-1 flex items-center gap-2'>
        <StarOutlined className='text-base text-amber-400' />
        <span className='text-[15px] font-semibold text-[#1C1917]'>Đánh giá môn học</span>
      </div>
      <p className='mb-4 text-sm leading-relaxed text-gray-500'>
        Đánh giá của bạn giúp hệ thống gợi ý môn học chính xác hơn cho bạn và những sinh viên khác.
      </p>

      <div className='mb-4 rounded-xl border border-stone-100 bg-[#FAF9F7] px-4 py-3'>
        <div className='text-[14px] font-semibold text-[#1C1917]'>Mức độ hài lòng tổng thể</div>
        <p className='mt-0.5 mb-2 text-[12px] leading-[1.6] text-gray-500'>
          Điểm duy nhất thể hiện bạn thích hay không thích môn học.
        </p>
        <SatisfactionRating
          value={satisfaction}
          onChange={(score) => {
            setSatisfactionOverride(score);
            rateSatisfaction({
              method: 'PUT',
              url: `/courses/${courseId}/satisfaction`,
              data: { score },
            });
          }}
        />
      </div>

      <div className='mb-2 text-[14px] font-semibold text-[#1C1917]'>Đánh giá thuộc tính</div>
      <AttributeRating
        attributes={attributes}
        attributeIdToRatingScore={ratings}
        onRatingChange={(attributeId, score) => {
          rateCourse({
            method: 'PUT',
            url: `/courses/${courseId}/rating`,
            data: { attributeId, score },
          });
        }}
      />
    </div>
  );
}
