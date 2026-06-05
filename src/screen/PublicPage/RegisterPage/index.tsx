import useRequest from '@/common/hooks/network/useRequest';
import { GlobalErrorCode } from '@/common/types/GlobalErrorCode';
import { RestError } from '@/common/types/Network';
import { ProForm, ProFormDependency, ProFormText } from '@ant-design/pro-components';
import { Button, Card } from 'antd';
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

  const handleLogin = async () => {
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
    <div className='w-screen h-screen flex justify-center items-center px-10 md:px-0'>
      <Card className='w-full md:w-[400px] shadow-xl'>
        <div className='flex justify-center mb-4'>
          <div className='flex items-center gap-2'>
            <div className='mb-0! text-center font-bold text-4xl'>Đăng Ký</div>
          </div>
        </div>

        <ProForm<RegisterFormType> form={form} submitter={false}>
          <ProFormText
            name='email'
            label='Email'
            placeholder={'Nhập email'}
            rules={[{ required: true, message: 'Email không được trống' }]}
          />
          <ProFormText
            name='fullName'
            label='Họ và tên'
            placeholder={'Nhập họ và tên của bạn'}
            rules={[{ required: true, message: 'Họ và tên không được trống' }]}
          />
          <ProFormText.Password
            name='password'
            label='Mật khẩu'
            placeholder={'Nhập mật khẩu'}
            rules={[{ required: true, message: 'Mật khẩu không được trống' }]}
          />
          <ProFormDependency name={['password']}>
            {({ password }) => {
              return (
                <ProFormText.Password
                  name='confirmPassword'
                  label='Nhập lại mật khẩu'
                  required
                  placeholder={'Nhập lại mật khẩu'}
                  validateTrigger='onSubmit'
                  rules={[
                    { required: true, message: 'Mật khẩu nhập lại không được trống' },
                    {
                      validator: (_, value) => {
                        if (value !== password) {
                          return Promise.reject(
                            'Mật khẩu nhập lại không trùng khớp với mật khẩu ban đầu',
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                />
              );
            }}
          </ProFormDependency>
        </ProForm>

        <Button
          className='w-full mt-2'
          type='primary'
          loading={registerPending}
          onClick={handleLogin}
        >
          Đăng ký
        </Button>
        <div className='my-3'></div>
        <div className='flex justify-center'>
          <Link to={'/public-path/login'}>Quay lại đăng nhập</Link>
        </div>
      </Card>
    </div>
  );
}
