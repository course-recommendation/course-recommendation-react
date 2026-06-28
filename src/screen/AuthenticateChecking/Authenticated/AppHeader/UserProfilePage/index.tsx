import useRequest from '@/common/hooks/network/useRequest'
import {User} from '@/common/types/User.types'
import {useMeContext} from '@/screen/AuthenticateChecking/Authenticated/context/MeContext'
import {Button, Divider, Form, Input, Typography} from 'antd'
import useApp from 'antd/es/app/useApp'
import {useState} from 'react'

export default function UserProfilePage() {
  const { me } = useMeContext()
  const { message } = useApp()
  const [form] = Form.useForm()
  const [currentMe, setCurrentMe] = useState<User>(me)
  const { request: updateProfile, isPending: updatePending } = useRequest<User>()
  const { request: requestReset, isPending: resetPending } = useRequest<void>()

  const handleSaveName = async () => {
    try {
      const values = await form.validateFields()
      const response = await updateProfile({
        url: '/me/profile',
        method: 'PUT',
        data: { fullName: values.fullName },
      })
      setCurrentMe(response.data!)
      message.success('Cập nhật tên thành công')
    } catch {
      message.error('Đã có lỗi xảy ra')
    }
  }

  const handlePasswordReset = async () => {
    try {
      await requestReset({
        url: '/auth/password-reset/request',
        method: 'POST',
        data: { email: currentMe.email },
      })
      message.success('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.')
    } catch {
      message.error('Đã có lỗi xảy ra')
    }
  }

  return (
    <div className='max-w-lg mx-auto'>
      <Typography.Title level={3} className='mb-6'>
        Thông tin tài khoản
      </Typography.Title>

      <div
        className='bg-white rounded-2xl px-8 py-8 space-y-6'
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)' }}
      >
        <div>
          <Typography.Text type='secondary' className='text-xs uppercase tracking-wide'>
            Email
          </Typography.Text>
          <div className='mt-1'>
            <Typography.Text className='text-base'>{currentMe.email}</Typography.Text>
          </div>
        </div>

        <Divider/>

        <div className=''>
          <Typography.Text type='secondary' className='text-xs uppercase tracking-wide'>
            Họ và tên
          </Typography.Text>
          <Form form={form} className='mt-2' initialValues={{ fullName: currentMe.fullName }}>
            <Form.Item
              name='fullName'
              rules={[{ required: true, message: 'Tên không được để trống' }]}
              className='mb-3'
            >
              <Input size='large' placeholder='Nhập họ và tên' />
            </Form.Item>
            <Button type='primary' loading={updatePending} onClick={handleSaveName}>
              Lưu tên
            </Button>
          </Form>
        </div>
        <Divider/>
        <div className=''>
          <Typography.Text
            type='secondary'
            className='text-xs uppercase tracking-wide block mb-3'
          >
            Mật khẩu
          </Typography.Text>
          <Button danger loading={resetPending} onClick={handlePasswordReset}>
          Đặt lại mật khẩu
          </Button>
        </div>
      </div>
    </div>
  )
}
