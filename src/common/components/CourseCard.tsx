import { Button, Card } from 'antd';
import { Link } from 'react-router';
import { CourseDetail } from '../types/Course.types';

type Props = {
  courseDetail: CourseDetail;
};

export default function CourseCard({ courseDetail }: Props) {
  const course = courseDetail.course;
  return (
    <Link to={`/courses/${course.code}`}>
      <Card
        styles={{
          body: {
            padding: 0,
          },
        }}
        variant='borderless'
        className='overflow-hidden shadow hover:shadow-xl transition-shadow'
      >
        <img src={course.thumbnailUrl} className='w-full h-32 object-cover' />
        <div className='p-5'>
          <div className='text-xl font-bold line-clamp-1'>{course.name}</div>
          <div className='my-2'></div>
          <div className='text-gray-600 line-clamp-2'>{course.description}</div>
          <div className='my-2'></div>
          <div className='flex justify-end'>
            <Button type='link' className='font-bold'>
              Xem chi tiết →
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
