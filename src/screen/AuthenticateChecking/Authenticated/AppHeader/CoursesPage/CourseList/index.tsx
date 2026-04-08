import CourseCard from '@/common/components/CourseCard';
import { CourseDetail } from '@/common/types/Course.types';
import { Empty, Skeleton } from 'antd';

type Props = {
  courseDetails?: CourseDetail[];
  loading: boolean;
};

export default function CourseList({ courseDetails: courseDetailsOpt, loading }: Props) {
  return (
    <div>
      {(() => {
        if (loading) {
          return <Skeleton />;
        }

        const courseDetails = courseDetailsOpt!;
        const isEmpty = courseDetails.length === 0;

        if (isEmpty) {
          return <Empty description={'Không có môn học nào'} />;
        }
        return (
          <div className='grid grid-cols-4 gap-5'>
            {courseDetails.map((courseDetail) => {
              return <CourseCard key={courseDetail.course.code} courseDetail={courseDetail} />;
            })}
          </div>
        );
      })()}
    </div>
  );
}
