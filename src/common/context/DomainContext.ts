import { Domain } from "@/common/types/Course.types";
import { createContext, useContext } from "react";

export type DomainContextType = Domain;

export const CourseDomainContext = createContext<DomainContextType>(null!);

export function useCourseDomainContext() {
  return useContext(CourseDomainContext);
}
