import { App } from 'antd';
import { Outlet } from 'react-router';
import { LocalStorageKey } from './common/constants/LocalStorageKey';
import { CourseDomainContext, DomainContextType } from './common/context/DomainContext';
import { Algorithm, Dataset } from './common/types/Course.types';
import './index.css';

const defaultCourseDomain: DomainContextType = {
  algorithm: Algorithm.FS,
  dataset: Dataset.FIT,
};

function Root() {
  const algorithm: Algorithm =
    (localStorage.getItem(LocalStorageKey.ALGORITHM) as Algorithm | null) ??
    defaultCourseDomain.algorithm;
  const dataset: Dataset =
    (localStorage.getItem(LocalStorageKey.DATASET) as Dataset | null) ??
    defaultCourseDomain.dataset;

  return (
    <App>
      <CourseDomainContext value={{ algorithm, dataset }}>
        <Outlet />
      </CourseDomainContext>
    </App>
  );
}

export default Root;
