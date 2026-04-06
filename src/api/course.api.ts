import useGet from '@/common/hooks/network/useGet';
import { CourseDetail, Domain } from '@/common/types/Course.types';

export function useGetCourseDetails({ domain, name }: { domain: Domain; name: string }) {
  return useGet<CourseDetail[]>(`/courses/detail`, {
    params: {
      domain,
      name,
    },
  });
}
