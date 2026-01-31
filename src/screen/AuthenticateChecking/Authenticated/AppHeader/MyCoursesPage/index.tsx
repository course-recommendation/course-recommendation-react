import { useCourseDomainContext } from "@/common/context/CourseDomainContext";
import MyCourses from "./MyCourses";

export default function MyCoursesPage() {
  const { algorithm, dataset } = useCourseDomainContext();

  return <MyCourses algorithm={algorithm} dataset={dataset} />;
}
