import { useCourseDomainContext } from "@/common/context/CourseDomainContext";
import { CourseAlgorithm } from "@/common/types/Course.types";
import FSRecommendation from "./FSRecommendation";

export default function RecommendationPage() {
  const { algorithm, dataset } = useCourseDomainContext();

  return (
    <div>
      {(() => {
        if (algorithm === CourseAlgorithm.FS) {
          return <FSRecommendation dataset={dataset} />;
        }

        return <div></div>;
      })()}
    </div>
  );
}
