import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import { Algorithm } from '@/common/types/Course.types';
import FSRecommendation from './FSRecommendation';

export default function RecommendationPage() {
  const algorithm = useAlgorithmContext();

  return (
    <>
      {(() => {
        if (algorithm === Algorithm.FS) {
          return <FSRecommendation />;
        }

        return <div></div>;
      })()}
    </>
  );
}
