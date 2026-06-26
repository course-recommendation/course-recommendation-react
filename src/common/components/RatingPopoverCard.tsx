import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import { useAttributeValues } from '@/common/hooks/useAttributeValues';
import {
  Algorithm,
  CourseDetail,
  GetCourseDetailsRequest,
  RateCourseRequest,
} from '@/common/types/Course.types';
import AttributeRating from '@/screen/AuthenticateChecking/Authenticated/AppHeader/CourseDetailPage/AttributeRating';
import { StarOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';

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

  if (attributesPending || courseDetailPending) {
    return (
      <div style={{ width: 360 }}>
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>
    );
  }

  const attributes = attributeValuesResponse!.data;
  const ratings = courseDetailResponse!.data.userAttributeIdToRatingScore;

  return (
    <div style={{ width: 380, maxHeight: 480, overflowY: 'auto', padding: '8px 4px' }}>
      <div className='mb-1 flex items-center gap-2'>
        <StarOutlined className='text-base text-amber-400' />
        <span className='text-[15px] font-semibold text-[#1C1917]'>Đánh giá môn học</span>
      </div>
      <p className='mb-4 text-sm leading-relaxed text-gray-500'>
        Đánh giá của bạn giúp hệ thống gợi ý môn học chính xác hơn cho bạn và những sinh viên khác.
      </p>
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
