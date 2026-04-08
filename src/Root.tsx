import { App } from 'antd';
import { Outlet } from 'react-router';
import { LocalStorageKey } from './common/constants/LocalStorageKey';
import { AlgorithmContext } from './common/context/AlgorithmContext';
import { Algorithm } from './common/types/Course.types';
import './index.css';

const defaultAlgorithm = Algorithm.FS;

function Root() {
  const algorithm: Algorithm =
    (localStorage.getItem(LocalStorageKey.ALGORITHM) as Algorithm | null) ?? defaultAlgorithm;

  return (
    <App>
      <AlgorithmContext value={algorithm}>
        <Outlet />
      </AlgorithmContext>
    </App>
  );
}

export default Root;
