import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import MyCourses from './MyCourses';

export default function MyCoursesPage() {
  const algorithm = useAlgorithmContext();

  return <MyCourses algorithm={algorithm} />;
}
