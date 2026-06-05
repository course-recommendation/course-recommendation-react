import { Algorithm, Attribute } from '../types/Course.types';
import useGet from './network/useGet';

export function useAttributeValues({ algorithm }: { algorithm: Algorithm }) {
  const { data, isPending } = useGet<Attribute[]>(`/attributes`, {
    params: {
      algorithm,
    },
  });
  return { data, isPending };
}
