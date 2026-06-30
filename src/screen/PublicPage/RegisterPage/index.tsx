import BookIcon from '@/assets/icons/BookIcon';
import useRequest from '@/common/hooks/network/useRequest';
import { GlobalErrorCode } from '@/common/types/GlobalErrorCode';
import { RestError } from '@/common/types/Network';
import { ProForm, ProFormDependency, ProFormText } from '@ant-design/pro-components';
import { Button } from 'antd';
import useApp from 'antd/es/app/useApp';
import { useForm } from 'antd/es/form/Form';
import { Link, useNavigate } from 'react-router';

type RegisterFormType = {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
};

type RegisterRequest = {
  email: string;
  password: string;
  fullName: string;
};

export default function RegisterPage() {
  const [form] = useForm<RegisterFormType>();
  const { request: register, isPending: registerPending } = useRequest<void, RegisterRequest>();
  const { message } = useApp();
  const navigate = useNavigate();

  const handleRegister = async () => {
    const formValues = await form.validateFields();

    try {
      await register({
        url: '/auth/register',
        method: 'POST',
        data: {
          email: formValues.email,
          password: formValues.password,
          fullName: formValues.fullName,
        },
      });

      message.success('Đăng ký thành công');
      navigate('/');
    } catch (error) {
      if (error instanceof RestError) {
        if (error.errorCode === GlobalErrorCode.EMAIL_DUPLICATED) {
          form.setFields([{ name: 'email', errors: ['Email này đã được sử dụng'] }]);
          return;
        }
      }
      message.error('Đã có lỗi xảy ra');
    }
  };

  return (
    <div className='min-h-screen bg-[#FAF9F7] flex items-center justify-center px-4 py-10'>
      <div className='w-full max-w-md'>
        {/* Brand */}
        <div className='flex flex-col items-center mb-8'>
          <div className='flex items-center gap-2.5 mb-3'>
            <BookIcon className='text-indigo-700 w-9 h-9' />
            <span className='font-bold text-2xl text-[#1C1917] tracking-tight'>CoursePilot</span>
          </div>
          <h1 className='text-[28px] font-semibold text-[#1C1917] text-center'>Tạo tài khoản</h1>
          <p className='text-gray-500 text-sm mt-1 text-center'>
            Bắt đầu hành trình học tập của bạn hôm nay.
          </p>
        </div>

        {/* Card */}
        <div
          className='bg-white rounded-2xl px-8 py-8'
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)' }}
        >
          <ProForm<RegisterFormType> form={form} submitter={false}>
            <ProFormText
              name='email'
              label='Email'
              placeholder='Nhập email'
              rules={[{ required: true, message: 'Email không được trống' }]}
            />
            <ProFormText
              name='fullName'
              label='Họ và tên'
              placeholder='Nhập họ và tên của bạn'
              rules={[{ required: true, message: 'Họ và tên không được trống' }]}
            />
            <ProFormText.Password
              name='password'
              label='Mật khẩu'
              placeholder='Nhập mật khẩu'
              rules={[{ required: true, message: 'Mật khẩu không được trống' }]}
            />
            <ProFormDependency name={['password']}>
              {({ password }) => (
                <ProFormText.Password
                  name='confirmPassword'
                  label='Nhập lại mật khẩu'
                  required
                  placeholder='Nhập lại mật khẩu'
                  validateTrigger='onSubmit'
                  rules={[
                    { required: true, message: 'Mật khẩu nhập lại không được trống' },
                    {
                      validator: (_, value) =>
                        value !== password
                          ? Promise.reject('Mật khẩu nhập lại không trùng khớp')
                          : Promise.resolve(),
                    },
                  ]}
                />
              )}
            </ProFormDependency>
          </ProForm>

          <Button
            className='w-full mt-1'
            type='primary'
            size='large'
            loading={registerPending}
            onClick={handleRegister}
          >
            Đăng ký
          </Button>

          <div className='mt-5 text-center text-sm text-gray-500'>
            Đã có tài khoản?{' '}
            <Link to='/public-path/login' className='text-indigo-700 font-medium'>
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
