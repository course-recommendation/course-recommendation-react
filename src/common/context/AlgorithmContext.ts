import { createContext, useContext } from 'react';
import { Algorithm } from '../types/Course.types';

export type AlgorithmContext = Algorithm;

export const AlgorithmContext = createContext<AlgorithmContext>(null!);

export function useAlgorithmContext() {
  return useContext(AlgorithmContext);
}
