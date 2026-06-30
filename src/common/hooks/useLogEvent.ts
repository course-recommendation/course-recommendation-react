import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import { useShowExplanationContext } from '@/common/context/ShowExplanationContext';
import { StatsigEvent } from '@/common/constants/analyticsEvents';
import { useStatsigClient } from '@statsig/react-bindings';
import { useTenantName } from './useTenantName';

export function useLogEvent() {
  const { client } = useStatsigClient();
  const tenantName = useTenantName();
  const showExplanation = useShowExplanationContext();
  const algorithm = useAlgorithmContext();

  return (eventName: StatsigEvent, value?: string | number, metadata?: Record<string, string>) => {
    client.logEvent(eventName, value, {
      ...metadata,
      algorithm,
      tenantName,
      showExplanation: String(showExplanation),
    });
  };
}
