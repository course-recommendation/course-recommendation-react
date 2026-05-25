import { Card } from 'antd';
import { ReactNode } from 'react';
import { Link } from 'react-router';
import { CourseDetail } from '../types/Course.types';

type Props = {
  courseDetail: CourseDetail;
  extra?: ReactNode;
  courseName?: ReactNode;
  topLeftBadge?: ReactNode;
  topRightBadge?: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
};

export default function RecommendedCourseCard({
  courseDetail,
  extra,
  courseName,
  topLeftBadge,
  topRightBadge,
  onClick,
}: Props) {
  return (
    <Link
      to={`/courses/${courseDetail.course.code}`}
      onClick={(e) => {
        onClick?.(e);
      }}
    >
      <Card
        variant='borderless'
        className='relative overflow-hidden group bg-white border border-gray-200 shadow-sm transition-all duration-200 hover:bg-blue-50/40 hover:border-blue-300 hover:shadow-md'
      >
        {topLeftBadge && <div className='absolute top-3 left-3 z-10'>{topLeftBadge}</div>}
        {topRightBadge && <div className='absolute top-3 right-3 z-10'>{topRightBadge}</div>}
        <div className='flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-5'>
          <div className='w-full md:w-52 aspect-video overflow-hidden rounded-xl shrink-0'>
            <img
              src={`https://picsum.photos/seed/${courseDetail.course.code}/1600/900`}
              className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-110'
            />
          </div>
          <div className='flex flex-col gap-3 w-full min-w-0'>
            <div className='text-lg md:text-xl font-bold line-clamp-2 md:line-clamp-1'>
              {courseName ?? courseDetail.course.name}
            </div>
            <div className='line-clamp-3 md:line-clamp-2 text-gray-600'>
              {courseDetail.course.description}
            </div>
            {extra}
          </div>
        </div>
      </Card>
    </Link>
  );
}
