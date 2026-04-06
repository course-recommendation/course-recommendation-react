import CourseCard from '@/common/components/CourseCard';
import { CourseDetail } from '@/common/types/Course.types';

type Props = {
  courseDetails: CourseDetail[];
};

export default function CourseList({ courseDetails }: Props) {
  return (
    <div className='grid grid-cols-4 gap-5'>
      {courseDetails.map((courseDetail) => {
        return <CourseCard key={courseDetail.course.code} courseDetail={courseDetail} />;
      })}
    </div>
  );
}
