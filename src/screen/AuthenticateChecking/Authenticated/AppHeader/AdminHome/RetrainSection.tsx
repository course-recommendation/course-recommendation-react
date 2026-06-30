import { SyncOutlined } from '@ant-design/icons';
import { Button, Card, message, Typography } from 'antd';
import { useState } from 'react';

import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import defaultAxios from '@/common/services/defaultAxios';
import { Algorithm } from '@/common/types/Course.types';

export function RetrainSection() {
  const algorithm = useAlgorithmContext();
  const [fsLoading, setFsLoading] = useState(false);
  const [triRankLoading, setTriRankLoading] = useState(false);

  const handleTrainFs = async () => {
    setFsLoading(true);
    try {
      await defaultAxios.post('/admin/fs/train');
      message.success('Huấn luyện thành công');
    } catch {
      message.error('Huấn luyện thất bại');
    } finally {
      setFsLoading(false);
    }
  };

  const handleTrainTriRank = async () => {
    setTriRankLoading(true);
    try {
      await defaultAxios.post('/admin/trirank/train');
      message.success('Huấn luyện thành công');
    } catch {
      message.error('Huấn luyện thất bại');
    } finally {
      setTriRankLoading(false);
    }
  };

  return (
    <Card
      title={
        <span className='flex items-center gap-2'>
          <SyncOutlined className='text-indigo-600' />
          Huấn luyện mô hình
        </span>
      }
    >
      <div className='flex flex-col gap-4'>
        <div className='rounded-xl border border-indigo-100 bg-indigo-50 p-4'>
          <Typography.Text style={{ color: '#4338CA' }}>
            Huấn luyện lại mô hình giúp hệ thống cập nhật các gợi ý dựa trên{' '}
            <Typography.Text strong style={{ color: '#4338CA' }}>
              đánh giá và bình luận mới nhất của người dùng
            </Typography.Text>{' '}
            kể từ lần huấn luyện trước, đồng thời có thể gợi ý thêm các{' '}
            <Typography.Text strong style={{ color: '#4338CA' }}>
              khóa học mới
            </Typography.Text>{' '}
            được thêm vào hệ thống.
          </Typography.Text>
        </div>

        <Typography.Text>
          Nếu không kích hoạt thủ công, hệ thống sẽ tự động huấn luyện lại mô hình vào lúc{' '}
          <Typography.Text strong>00:00 mỗi ngày</Typography.Text>.
        </Typography.Text>
        <div>
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
        </div>
      </div>
    </Card>
  );
}
