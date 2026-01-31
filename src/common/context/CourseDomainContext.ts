import { CourseDomain } from "@/common/types/Course.types";
import { createContext, useContext } from "react";

export type CourseDomainContextType = CourseDomain;

export const CourseDomainContext = createContext<CourseDomainContextType>(null!);

export function useCourseDomainContext() {
  return useContext(CourseDomainContext);
}
