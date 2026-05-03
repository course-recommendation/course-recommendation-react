import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import { Algorithm } from '@/common/types/Course.types';
import FSRecommendation from './FSRecommendation';
import TriRankRecommendation from './TriRankRecommendation';

export default function RecommendationPage() {
  const algorithm = useAlgorithmContext();

  return (
    <>
      {(() => {
        if (algorithm === Algorithm.FS) {
          return <FSRecommendation />;
        }

        if (algorithm === Algorithm.TRI_RANK) {
          return <TriRankRecommendation />;
        }

        return null;
      })()}
    </>
  );
}
