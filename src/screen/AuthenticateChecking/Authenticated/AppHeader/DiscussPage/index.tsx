import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import Discuss from './Discuss';

export default function DiscussPage() {
  const algorithm = useAlgorithmContext();

  return (
    <div className='h-full'>
      <Discuss algorithm={algorithm} />
    </div>
  );
}
