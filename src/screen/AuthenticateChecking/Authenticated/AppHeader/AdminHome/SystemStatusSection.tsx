import { PoweroffOutlined } from '@ant-design/icons';
import { Card, message, Switch, Typography } from 'antd';
import { useState } from 'react';

import useGet from '@/common/hooks/network/useGet';
import defaultAxios from '@/common/services/defaultAxios';

export function SystemStatusSection() {
  const { data: tenantReadyResponse, refetch } = useGet<boolean>('/admin/tenant-ready');
  const systemEnabled = tenantReadyResponse?.data ?? false;
  const [loading, setLoading] = useState(false);

  const handleToggle = async (enabled: boolean) => {
    setLoading(true);
    try {
      await defaultAxios.put('/admin/system-enabled', { enabled });
      refetch();
      message.success(enabled ? 'Đã bật hệ thống' : 'Đã tắt hệ thống');
    } catch {
      message.error('Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        <span className='flex items-center gap-2'>
        <PoweroffOutlined className={'text-primary'} />
          Trạng thái hệ thống
        </span>
      }
    >
      <div className='flex items-center justify-between'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${systemEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
            <Typography.Text strong style={{ fontSize: 16 }}>
              {systemEnabled ? 'Hệ thống đang bật' : 'Hệ thống đang tắt'}
            </Typography.Text>
          </div>
          <Typography.Text type='secondary' className='text-sm'>
            {systemEnabled
              ? 'Người dùng có thể truy cập và sử dụng tính năng gợi ý môn học.'
              : 'Bật khi dữ liệu gợi ý đã sẵn sàng'}
          </Typography.Text>
        </div>
        <Switch
          checked={systemEnabled}
          loading={loading}
          onChange={handleToggle}
          // checkedChildren='Bật'
          // unCheckedChildren='Tắt'
        />
      </div>
    </Card>
  );
}
