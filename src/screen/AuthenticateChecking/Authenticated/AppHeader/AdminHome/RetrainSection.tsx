import { Button, message, Typography } from 'antd';
import { useState } from 'react';

import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import defaultAxios from '@/common/services/defaultAxios';
import { Algorithm } from '@/common/types/Course.types';

const { Title } = Typography;

export function RetrainSection() {
  const algorithm = useAlgorithmContext();
  const [fsLoading, setFsLoading] = useState(false);
  const [triRankLoading, setTriRankLoading] = useState(false);

  const handleTrainFs = async () => {
    setFsLoading(true);
    try {
      await defaultAxios.post('/admin/fs/train');
      message.success('Huấn luyện FS thành công');
    } catch {
      message.error('Huấn luyện FS thất bại');
    } finally {
      setFsLoading(false);
    }
  };

  const handleTrainTriRank = async () => {
    setTriRankLoading(true);
    try {
      await defaultAxios.post('/admin/trirank/train');
      message.success('Huấn luyện TriRank thành công');
    } catch {
      message.error('Huấn luyện TriRank thất bại');
    } finally {
      setTriRankLoading(false);
    }
  };

  return (
    <>
      <Title level={4}>Huấn luyện mô hình</Title>
      <Button
        type='primary'
        size='large'
        loading={fsLoading || triRankLoading}
        onClick={() => {
          if (algorithm === Algorithm.FS) {
            handleTrainFs();
          }
          if (algorithm === Algorithm.TRI_RANK) {
            handleTrainTriRank();
          }
        }}
      >
        Huấn luyện lại hệ thống gợi ý
      </Button>
    </>
  );
}
