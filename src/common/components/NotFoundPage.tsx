import { Button, Result } from 'antd';
import { useNavigate } from 'react-router';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Result
      status='404'
      title='404'
      subTitle='Trang này không tồn tại'
      extra={
        <Button type='primary' onClick={() => navigate('/')}>
          Về trang chủ
        </Button>
      }
    />
  );
}
