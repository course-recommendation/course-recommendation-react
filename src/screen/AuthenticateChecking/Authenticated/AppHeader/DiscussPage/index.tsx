import { useCourseDomainContext } from "@/common/context/DomainContext";
import Discuss from "./Discuss";

export default function DiscussPage() {
  const { algorithm, dataset } = useCourseDomainContext();

  return <Discuss algorithm={algorithm} dataset={dataset} />;
}
