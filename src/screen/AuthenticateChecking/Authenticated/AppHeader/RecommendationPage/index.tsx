import { useCourseDomainContext } from '@/common/context/DomainContext';
import { Algorithm } from '@/common/types/Course.types';
import FSRecommendation from './FSRecommendation';

export default function RecommendationPage() {
  const { algorithm, dataset } = useCourseDomainContext();

  return (
    <div>
      {(() => {
        if (algorithm === Algorithm.FS) {
          return <FSRecommendation dataset={dataset} />;
        }

        return <div></div>;
      })()}
    </div>
  );
}
