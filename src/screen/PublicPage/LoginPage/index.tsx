import BookIcon from '@/assets/icons/BookIcon';
import { LocalStorageKey } from '@/common/constants/LocalStorageKey';
import useRequest from '@/common/hooks/network/useRequest';
import { GlobalErrorCode } from '@/common/types/GlobalErrorCode';
import { RestError } from '@/common/types/Network';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Button, Checkbox } from 'antd';
import useApp from 'antd/es/app/useApp';
import { useForm } from 'antd/es/form/Form';
import { useState } from 'react';

type LoginFormType = {
  email: string;
  password: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { message } = useApp();
  const [form] = useForm<LoginFormType>();
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    return !!localStorage.getItem(LocalStorageKey.REMEMBERED_EMAIL);
  });
  const { request: login, isPending: loginPending } = useRequest<
    { accessToken: string },
    LoginRequest
  >();
  const { request: forgotPassword, isPending: forgotPending } = useRequest<void>();

  const initialValues: Partial<LoginFormType> = {
    email: localStorage.getItem(LocalStorageKey.REMEMBERED_EMAIL) ?? undefined,
    password: localStorage.getItem(LocalStorageKey.REMEMBERED_PASSWORD) ?? undefined,
  };

  const handleLogin = async () => {
    const formValues = await form.validateFields();

    if (rememberMe) {
      localStorage.setItem(LocalStorageKey.REMEMBERED_EMAIL, formValues.email);
      localStorage.setItem(LocalStorageKey.REMEMBERED_PASSWORD, formValues.password);
    } else {
      localStorage.removeItem(LocalStorageKey.REMEMBERED_EMAIL);
      localStorage.removeItem(LocalStorageKey.REMEMBERED_PASSWORD);
    }

    try {
      const loginResponse = (
        await login({
          url: '/auth/login',
          method: 'POST',
          data: {
            email: formValues.email,
            password: formValues.password,
          },
        })
      ).data;

      localStorage.setItem(LocalStorageKey.ACCESS_TOKEN, loginResponse.accessToken);
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get('redirect') ?? '/';
    } catch (error) {
      if (error instanceof RestError) {
        if (error.errorCode === GlobalErrorCode.EMAIL_NOT_FOUND) {
          form.setFields([{ name: 'email', errors: ['Email không tồn tại'] }]);
          return;
        }
        if (error.errorCode === GlobalErrorCode.WRONG_PASSWORD) {
          form.setFields([{ name: 'password', errors: ['Mật khẩu không đúng'] }]);
          return;
        }
      }
      message.error('Đã có lỗi xảy ra');
    }
  };

  const handleForgotPassword = async () => {
    const email = form.getFieldValue('email');
    if (!email) {
      form.setFields([{ name: 'email', errors: ['Vui lòng nhập email để lấy lại mật khẩu'] }]);
      return;
    }

    try {
      await forgotPassword({
        url: '/auth/password-reset/request',
        method: 'POST',
        data: { email },
      });
      message.success('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.');
    } catch {
      message.error('Đã có lỗi xảy ra');
    }
  };

  return (
    <div className='min-h-screen bg-[#FAF9F7] flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        {/* Brand */}
        <div className='flex flex-col items-center mb-8'>
          <div className='flex items-center gap-2.5 mb-3'>
            <BookIcon className='text-indigo-700 w-9 h-9' />
            <span className='font-bold text-2xl text-[#1C1917] tracking-tight'>CoursePilot</span>
          </div>
          <h1 className='text-[28px] font-semibold text-[#1C1917] text-center'>Đăng nhập</h1>
          <p className='text-gray-500 text-sm mt-1 text-center'>
            Khám phá các khóa học phù hợp với bạn.
          </p>
        </div>

        {/* Card */}
        <div
          className='bg-white rounded-2xl px-8 py-8'
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)' }}
        >
          <ProForm<LoginFormType> form={form} submitter={false} initialValues={initialValues}>
            <ProFormText
              name='email'
              label='Email'
              placeholder='Nhập email của bạn'
              rules={[{ required: true, message: 'Email không được trống' }]}
              fieldProps={{ onPressEnter: handleLogin }}
            />
            <ProFormText.Password
              name='password'
              label='Mật khẩu'
              placeholder='Nhập mật khẩu'
              rules={[{ required: true, message: 'Mật khẩu không được trống' }]}
              fieldProps={{ onPressEnter: handleLogin }}
            />
          </ProForm>

          <div className='flex items-center justify-between mb-4'>
            <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
              Ghi nhớ đăng nhập
            </Checkbox>
            <Button
              type='link'
              size='small'
              className='p-0 text-indigo-700'
              loading={forgotPending}
              onClick={handleForgotPassword}
            >
              Quên mật khẩu?
            </Button>
          </div>

          <Button
            className='w-full mt-1'
            type='primary'
            size='large'
            loading={loginPending}
            onClick={handleLogin}
          >
            Đăng nhập
          </Button>

          {/*<div className='mt-5 text-center text-sm text-gray-500'>*/}
          {/*  Chưa có tài khoản?{' '}*/}
          {/*  <Link to='/public-path/register' className='text-indigo-700 font-medium'>*/}
          {/*    Đăng ký ngay*/}
          {/*  </Link>*/}
          {/*</div>*/}
        </div>
      </div>
    </div>
  );
}
