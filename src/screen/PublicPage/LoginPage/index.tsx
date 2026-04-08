import { LocalStorageKey } from '@/common/constants/LocalStorageKey';
import useRequest from '@/common/hooks/network/useRequest';
import { GlobalErrorCode } from '@/common/types/GlobalErrorCode';
import { RestError } from '@/common/types/Network';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Button, Card } from 'antd';
import useApp from 'antd/es/app/useApp';
import { useForm } from 'antd/es/form/Form';
import { Link } from 'react-router';

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
  const { request: login, isPending: loginPending } = useRequest<
    { accessToken: string },
    LoginRequest
  >();

  const handleLogin = async () => {
    const formValues = await form.validateFields();

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

      window.location.href = '/';
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

  return (
    <div className='w-screen h-screen flex justify-center items-center px-10 md:px-0'>
      <Card className='w-full md:w-[400px] shadow-xl'>
        <div className='flex justify-center mb-4'>
          <div className='flex items-center gap-2'>
            <div className='mb-0! text-center font-bold text-4xl'>Đăng nhập</div>
          </div>
        </div>

        <ProForm<LoginFormType> form={form} submitter={false}>
          <ProFormText
            name='email'
            label='Email'
            placeholder={'Nhập email của bạn'}
            rules={[{ required: true, message: 'Email không được trống' }]}
          />
          <ProFormText.Password
            name='password'
            label='Mật khẩu'
            placeholder={'Nhập mật khẩu'}
            rules={[{ required: true, message: 'Mật khẩu không được trống' }]}
            fieldProps={{
              onPressEnter: handleLogin,
            }}
          />
        </ProForm>

        <Button className='w-full mt-2' type='primary' loading={loginPending} onClick={handleLogin}>
          Đăng nhập
        </Button>

        <div className='my-3'></div>

        <div className='flex gap-2 items-center justify-center'>
          <div>Chưa có tài khoản?</div>
          <Link to={'/public-path/register'}>Đăng ký</Link>
        </div>
      </Card>
    </div>
  );
}
