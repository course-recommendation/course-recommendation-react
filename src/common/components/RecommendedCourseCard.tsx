import { Card } from 'antd';
import { ReactNode } from 'react';
import { Link } from 'react-router';
import { CourseDetail } from '../types/Course.types';

type Props = {
  courseDetail: CourseDetail;
  extra?: ReactNode;
  courseName?: ReactNode;
};

export default function RecommendedCourseCard({ courseDetail, extra, courseName }: Props) {
  return (
    <Link to={`/courses/${courseDetail.course.code}`}>
      <Card variant='borderless' className='bg-gray-50 shadow-xs group hover:bg-gray-100'>
        <div className='flex items-center gap-5'>
          <div className='w-52 aspect-video overflow-hidden rounded-xl shrink-0'>
            <img
              src={`https://picsum.photos/seed/${courseDetail.course.code}/1600/900`}
              className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-110'
            />
          </div>
          <div className='flex flex-col gap-3'>
            <div className='text-xl font-bold line-clamp-1'>
              {courseName ?? courseDetail.course.name}
            </div>
            <div className='line-clamp-2 text-gray-600'>{courseDetail.course.description}</div>
            {extra}
          </div>
        </div>
      </Card>
    </Link>
  );
}
