import useRequest from '@/common/hooks/network/useRequest';
import { GlobalErrorCode } from '@/common/types/GlobalErrorCode';
import { RestError } from '@/common/types/Network';
import { User } from '@/common/types/User.types';
import { useMeContext } from '@/screen/AuthenticateChecking/Authenticated/context/MeContext';
import { Button, Form, Input, Typography } from 'antd';
import useApp from 'antd/es/app/useApp';
import { useState } from 'react';

const cardStyle = { boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)' };

export default function UserProfilePage() {
  const { me } = useMeContext();
  const { message } = useApp();
  const [form] = Form.useForm();
  const [currentMe, setCurrentMe] = useState<User>(me);
  const [isEditing, setIsEditing] = useState(false);
  const { request: updateProfile, isPending: updatePending } = useRequest<User>();
  const { request: requestReset, isPending: resetPending } = useRequest<void>();

  const handleEdit = () => {
    form.setFieldsValue({ fullName: currentMe.fullName, email: currentMe.email });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const response = await updateProfile({
        url: '/me/profile',
        method: 'PUT',
        data: { fullName: values.fullName, email: values.email },
      });
      setCurrentMe(response.data!);
      setIsEditing(false);
      message.success('Cập nhật thông tin thành công');
    } catch (error) {
      if (error instanceof RestError && error.errorCode === GlobalErrorCode.EMAIL_DUPLICATED) {
        form.setFields([{ name: 'email', errors: ['Email này đã được sử dụng'] }]);
      } else if (!(error instanceof Error && error.name === 'ValidateError')) {
        message.error('Đã có lỗi xảy ra');
      }
    }
  };

  const handlePasswordReset = async () => {
    try {
      await requestReset({
        url: '/auth/password-reset/request',
        method: 'POST',
        data: { email: currentMe.email },
      });
      message.success('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
    } catch {
      message.error('Đã có lỗi xảy ra');
    }
  };

  return (
    <div className='max-w-lg mx-auto'>
      <Typography.Title level={3} className='mb-6'>
        Thông tin tài khoản
      </Typography.Title>

      <div className='bg-white rounded-2xl px-8 py-8 mb-4' style={cardStyle}>
        <Typography.Title level={4} className='mb-6'>
          Thông tin cá nhân
        </Typography.Title>

        {isEditing ? (
          <Form form={form} layout='vertical'>
            <Form.Item
              label='Email'
              name='email'
              rules={[
                { required: true, message: 'Email không được để trống' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input size='large' placeholder='Nhập email' />
            </Form.Item>
            <Form.Item
              label='Họ và tên'
              name='fullName'
              rules={[{ required: true, message: 'Tên không được để trống' }]}
            >
              <Input size='large' placeholder='Nhập họ và tên' />
            </Form.Item>
            <div className='flex gap-2 mt-6'>
              <Button type='primary' loading={updatePending} onClick={handleSave}>
                Lưu
              </Button>
              <Button onClick={handleCancel} disabled={updatePending}>
                Hủy
              </Button>
            </div>
          </Form>
        ) : (
          <>
            <div className='space-y-4 mb-6'>
              <div>
                <Typography.Text type='secondary' className='text-xs uppercase tracking-wide'>
                  Email
                </Typography.Text>
                <div className='mt-1'>
                  <Typography.Text className='text-base'>{currentMe.email}</Typography.Text>
                </div>
              </div>
              <div>
                <Typography.Text type='secondary' className='text-xs uppercase tracking-wide'>
                  Họ và tên
                </Typography.Text>
                <div className='mt-1'>
                  <Typography.Text className='text-base'>{currentMe.fullName}</Typography.Text>
                </div>
              </div>
            </div>
            <Button type='primary' onClick={handleEdit}>
              Chỉnh sửa
            </Button>
          </>
        )}
      </div>

      <div className='bg-white rounded-2xl px-8 py-8' style={cardStyle}>
        <Typography.Title level={4} className='mb-2'>
          Mật khẩu
        </Typography.Title>
        <Typography.Text type='secondary' className='block mb-4 text-sm'>
          Gửi email đặt lại mật khẩu đến địa chỉ email của bạn.
        </Typography.Text>
        <Button danger loading={resetPending} onClick={handlePasswordReset}>
          Đặt lại mật khẩu
        </Button>
      </div>
    </div>
  );
}
