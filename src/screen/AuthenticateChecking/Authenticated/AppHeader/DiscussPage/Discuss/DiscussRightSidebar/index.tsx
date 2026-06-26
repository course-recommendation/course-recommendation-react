import { Course } from '@/common/types/Course.types';
import { MessageOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { Link } from 'react-router';

type TopCourse = {
  course: Course;
  count: number;
};

type Props = {
  topCourses: TopCourse[];
};

export default function DiscussRightSidebar({ topCourses }: Props) {
  return (
    <div className='flex flex-col gap-4 sticky top-4'>
      {/* Most discussed */}
      <div className='rounded-xl border border-[#E8E5E0] bg-white shadow-sm overflow-hidden'>
        <div className='px-4 py-3 border-b border-[#E8E5E0]'>
          <Typography.Text strong className='text-[#1C1917] text-sm'>
            Môn học thảo luận nhiều
          </Typography.Text>
        </div>
        <div className='py-1'>
          {topCourses.length === 0 ? (
            <p className='px-4 py-3 text-sm text-slate-400'>Chưa có bài viết nào</p>
          ) : (
            topCourses.map(({ course, count }) => (
              <Link
                key={course.id}
                to={`/courses/${course.code}`}
                className='flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition-colors group'
              >
                <span className='text-sm text-slate-700 group-hover:text-indigo-600 transition-colors truncate mr-2'>
                  {course.name}
                </span>
                <span className='flex items-center gap-1 text-xs text-slate-400 shrink-0'>
                  <MessageOutlined className='text-[10px]' />
                  {count}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Tips */}
      <div className='rounded-xl border border-[#E8E5E0] bg-white shadow-sm px-4 py-4'>
        <Typography.Text strong className='text-[#1C1917] text-sm block mb-1'>
          Mẹo thảo luận
        </Typography.Text>
        <ul className='space-y-1.5 text-xs text-slate-500 leading-relaxed list-none m-0 p-0'>
          <li>• Chia sẻ kinh nghiệm thực tế của bạn</li>
          <li>• Hỏi cụ thể để nhận câu trả lời hữu ích hơn</li>
          <li>• Tôn trọng ý kiến của người khác</li>
        </ul>
      </div>
    </div>
  );
}
