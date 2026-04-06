import { useCourseDomainContext } from '@/common/context/DomainContext';
import Discuss from './Discuss';

export default function DiscussPage() {
  const { algorithm, dataset } = useCourseDomainContext();

  return (
    <div className='h-full'>
      <Discuss algorithm={algorithm} dataset={dataset} />
    </div>
  );
}
