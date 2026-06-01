import { useParams } from 'react-router';

export function useTenantName(): string {
  const { tenantName } = useParams<{ tenantName: string }>();
  return tenantName!;
}
