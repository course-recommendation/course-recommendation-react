import useGet from '@/common/hooks/network/useGet';
import { Algorithm, CourseDetail } from '@/common/types/Course.types';

export function useGetCourseDetails({ algorithm, name }: { algorithm: Algorithm; name: string }) {
  return useGet<CourseDetail[]>(`/courses/detail`, {
    params: {
      algorithm,
      name,
    },
  });
}
