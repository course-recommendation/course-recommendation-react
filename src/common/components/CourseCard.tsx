import { Link } from 'react-router';
import { CourseDetail } from '../types/Course.types';

type Props = {
  courseDetail: CourseDetail;
};

export default function CourseCard({ courseDetail }: Props) {
  const course = courseDetail.course;
  return (
    <Link to={`/courses/${course.code}`} className='block group'>
      <div
        className='bg-[#FAF9F7] rounded-xl overflow-hidden border border-stone-200 transition-all duration-[180ms] ease-out hover:scale-[1.015]'
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)' }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(67,56,202,.12)')
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.boxShadow =
            '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)')
        }
      >
        <div className='overflow-hidden h-40'>
          <img
            src={course.thumbnailUrl}
            className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
          />
        </div>
        <div className='p-5'>
          <div className='text-[18px] font-semibold text-[#1C1917] line-clamp-1 leading-snug'>
            {course.name}
          </div>
          <div className='mt-2 text-gray-500 text-[14px] leading-[1.7] line-clamp-2'>
            {course.description}
          </div>
        </div>
      </div>
    </Link>
  );
}
