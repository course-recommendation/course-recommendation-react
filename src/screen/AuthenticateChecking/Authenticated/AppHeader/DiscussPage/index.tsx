import { useCourseDomainContext } from "@/common/context/CourseDomainContext";
import Discuss from "./Discuss";

export default function DiscussPage() {
  const { algorithm, dataset } = useCourseDomainContext();

  return <Discuss algorithm={algorithm} dataset={dataset} />;
}
