import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import Discuss from './Discuss';

export default function DiscussPage() {
  const algorithm = useAlgorithmContext();

  return (
    <div className='h-full rounded-3xl border border-indigo-100/70 bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/50 p-3 md:p-6'>
      <Discuss algorithm={algorithm} />
    </div>
  );
}
