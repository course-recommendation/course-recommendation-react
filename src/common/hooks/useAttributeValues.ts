import { Algorithm, Dataset } from "../types/Course.types";
import useGet from "./network/useGet";

export function useAttributeValues({
  algorithm,
  dataset,
}: {
  algorithm: Algorithm;
  dataset: Dataset;
}) {
  const { data, isPending } = useGet<string[]>(`/attributes`, {
    params: {
      algorithm,
      dataset,
    },
  });
  return { data, isPending };
}
