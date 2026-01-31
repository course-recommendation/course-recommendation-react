import { Outlet } from "react-router";
import { LocalStorageKey } from "./common/constants/LocalStorageKey";
import { CourseDomainContext, CourseDomainContextType } from "./common/context/CourseDomainContext";
import { CourseAlgorithm, CourseDataset } from "./common/types/Course.types";
import "./index.css";

const defaultCourseDomain: CourseDomainContextType = {
  algorithm: CourseAlgorithm.FS,
  dataset: CourseDataset.FIT,
};

function Root() {
  const algorithm: CourseAlgorithm =
    (localStorage.getItem(LocalStorageKey.ALGORITHM) as CourseAlgorithm | null) ??
    defaultCourseDomain.algorithm;
  const dataset: CourseDataset =
    (localStorage.getItem(LocalStorageKey.DATASET) as CourseDataset | null) ??
    defaultCourseDomain.dataset;

  return (
    <CourseDomainContext value={{ algorithm, dataset }}>
      <Outlet />
    </CourseDomainContext>
  );
}

export default Root;
