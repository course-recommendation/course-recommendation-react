import { LocalStorageKey } from '@/common/constants/LocalStorageKey';
import useRequest from '@/common/hooks/network/useRequest';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Button, Card, Typography } from 'antd';
import { useForm } from 'antd/es/form/Form';

type LoginFormType = {
  email: string;
  password: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

export default function Login() {
  const [form] = useForm<LoginFormType>();
  const { request: login, isPending: loginPending } = useRequest<
    { accessToken: string },
    LoginRequest
  >();

  const handleLogin = async () => {
    const formValues = await form.validateFields();

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
  };

  return (
    <div className='w-screen h-screen flex justify-center items-center px-10 md:px-0'>
      <Card className='w-full md:w-[400px] shadow-xl'>
        <div className='flex justify-center mb-4'>
          <Typography.Title level={3} className='mb-0! text-center'>
            App Name
          </Typography.Title>
        </div>

        <ProForm<LoginFormType> form={form} submitter={false}>
          <ProFormText name='email' label='Email' rules={[{ required: true }]} />
          <ProFormText.Password
            name='password'
            label='Mật khẩu'
            rules={[{ required: true }]}
            fieldProps={{
              onPressEnter: handleLogin,
            }}
          />
        </ProForm>

        <Button className='w-full mt-2' type='primary' loading={loginPending} onClick={handleLogin}>
          Đăng nhập
        </Button>
      </Card>
    </div>
  );
}
