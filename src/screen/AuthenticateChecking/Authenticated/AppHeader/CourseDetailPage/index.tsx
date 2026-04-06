import { useCourseDomainContext as useDomainContext } from '@/common/context/DomainContext';
import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import { useAttributeValues } from '@/common/hooks/useAttributeValues';
import {
  CourseDetail,
  GetCourseDetailsRequest,
  RateCourseRequest,
} from '@/common/types/Course.types';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Skeleton } from 'antd';
import { Link, useParams } from 'react-router';
import AttributeRating from './AttributeRating';

export default function CourseDetailPage() {
  const { courseCode: courseCodeOpt } = useParams();
  const domain = useDomainContext();
  const { algorithm, dataset } = domain;

  const courseCode = courseCodeOpt!;

  const { data: courseDetailResponse, isPending: courseDetailPending } = useGet<CourseDetail>(
    `/courses/${courseCode}/detail`,
    {
      params: { domain } as GetCourseDetailsRequest,
    },
  );

  const { data: attributeValuesResponse, isPending: attributeValuesPending } = useAttributeValues({
    algorithm,
    dataset,
  });

  const { request: rateCourse } = useRequest<void, RateCourseRequest>();

  return (
    <div>
      {(() => {
        if (courseDetailPending || attributeValuesPending) {
          return <Skeleton />;
        }

        const courseDetail = courseDetailResponse!.data;
        const course = courseDetail.course;
        const attributeValues = attributeValuesResponse!.data;

        return (
          <div>
            <Link to={'/courses'} className='font-medium text-xl'>
              ← Quay về danh sách môn học
            </Link>
            <div className='my-8'></div>
            <Card
              variant={'borderless'}
              className='shadow overflow-hidden'
              styles={{ body: { padding: 0 } }}
            >
              <img src={course.thumbnailUrl} className='w-full object-cover h-[300px]' />
              <div className='py-5 px-10'>
                <div className='text-2xl font-bold'>{course.name}</div>
                <div className='my-3'></div>
                <div className='text-gray-600'>{course.description}</div>
                <div className='my-4'></div>
                <div className='flex gap-3'>
                  <Button icon={<PlusOutlined />} type='primary' size='large'>
                    Dự kiến học
                  </Button>
                  <Button icon={<PlusOutlined />} variant='filled' size='large' color='default'>
                    Đã hoàn thành
                  </Button>
                </div>
                <Divider />
                <div className='text-2xl font-bold'>Đánh giá môn học</div>
                <div className='my-3'></div>
                <div className='text-gray-500 font-medium'>
                  Giúp hệ thống gợi ý môn học cho những sinh viên khác
                </div>
                <div className='my-5'></div>
                <div>
                  <AttributeRating
                    attributeValues={attributeValues}
                    attributeValueToRatingScore={courseDetail.userAttributeValueToRatingScore}
                    onRatingChange={async (attributeValue, score) => {
                      rateCourse({
                        method: 'PUT',
                        url: `/courses/${courseDetail.course.id}/rating`,
                        data: {
                          attributeValue,
                          score,
                        },
                      });
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>
        );
      })()}
    </div>
  );
}
