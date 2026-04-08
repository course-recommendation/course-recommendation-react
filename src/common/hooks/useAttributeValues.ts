import { Algorithm } from '../types/Course.types';
import useGet from './network/useGet';

export function useAttributeValues({ algorithm }: { algorithm: Algorithm }) {
  const { data, isPending } = useGet<string[]>(`/attributes`, {
    params: {
      algorithm,
    },
  });
  return { data, isPending };
}
