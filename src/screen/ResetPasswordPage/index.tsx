import BookIcon from '@/assets/icons/BookIcon';
import useRequest from '@/common/hooks/network/useRequest';
import { App, Button, Form, Input } from 'antd';
import useApp from 'antd/es/app/useApp';
import { useNavigate } from 'react-router';

function ResetPasswordPageInner() {
  const navigate = useNavigate();
  const { message } = useApp();
  const [form] = Form.useForm<{ newPassword: string; confirmPassword: string }>();
  const { request: confirmReset, isPending } = useRequest<void>();

  const token = new URLSearchParams(window.location.search).get('token');

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        form.setFields([{ name: 'confirmPassword', errors: ['Mật khẩu xác nhận không khớp'] }]);
        return;
      }
      await confirmReset({
        url: '/auth/password-reset/confirm',
        method: 'POST',
        data: { token, newPassword: values.newPassword },
      });
      message.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
      navigate('/public-path/login');
    } catch {
      message.error('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }
  };

  if (!token) {
    return (
      <div className='min-h-screen bg-[#FAF9F7] flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-500'>Link đặt lại mật khẩu không hợp lệ.</p>
          <Button type='link' onClick={() => navigate('/public-path/login')}>
            Về trang đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#FAF9F7] flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        <div className='flex flex-col items-center mb-8'>
          <div className='flex items-center gap-2.5 mb-3'>
            <BookIcon className='text-indigo-700 w-9 h-9' />
            <span className='font-bold text-2xl text-[#1C1917] tracking-tight'>CoursePilot</span>
          </div>
          <h1 className='text-[28px] font-semibold text-[#1C1917] text-center'>Đặt lại mật khẩu</h1>
          <p className='text-gray-500 text-sm mt-1 text-center'>Nhập mật khẩu mới của bạn.</p>
        </div>

        <div
          className='bg-white rounded-2xl px-8 py-8'
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)' }}
        >
          <Form form={form} layout='vertical'>
            <Form.Item
              name='newPassword'
              label='Mật khẩu mới'
              rules={[{ required: true, message: 'Mật khẩu không được để trống' }]}
            >
              <Input.Password size='large' placeholder='Nhập mật khẩu mới' />
            </Form.Item>

            <Form.Item
              name='confirmPassword'
              label='Xác nhận mật khẩu'
              rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }]}
            >
              <Input.Password
                size='large'
                placeholder='Nhập lại mật khẩu mới'
                onPressEnter={handleSubmit}
              />
            </Form.Item>
          </Form>

          <Button
            className='w-full mt-1'
            type='primary'
            size='large'
            loading={isPending}
            onClick={handleSubmit}
          >
            Đặt lại mật khẩu
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <App>
      <ResetPasswordPageInner />
    </App>
  );
}
