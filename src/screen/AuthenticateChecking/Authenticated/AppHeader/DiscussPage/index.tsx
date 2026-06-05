import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import Discuss from './Discuss';

export default function DiscussPage() {
  const algorithm = useAlgorithmContext();

  return (
    <div>
      <div className='mb-8'>
        <h1
          className='text-[28px] font-semibold text-[#1C1917] leading-tight'
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Thảo luận
        </h1>
        <div className='mt-2 w-8 h-[3px] rounded-full bg-indigo-700' />
      </div>
      <Discuss algorithm={algorithm} />
    </div>
  );
}
