import BookIcon from '@/assets/icons/BookIcon';
import useRequest from '@/common/hooks/network/useRequest';
import { GlobalErrorCode } from '@/common/types/GlobalErrorCode';
import { RestError } from '@/common/types/Network';
import { Spin, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';

type AssignedAccount = {
  username: string;
  password: string;
};

export default function SurveyAssignAccountPage() {
  const [account, setAccount] = useState<AssignedAccount | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { request: assignAccount, isPending } = useRequest<AssignedAccount>();
  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;

    (async () => {
      try {
        const response = await assignAccount({
          url: '/survey/assign-account',
          method: 'POST',
        });
        setAccount(response.data);
      } catch (error) {
        if (
          error instanceof RestError &&
          error.errorCode === GlobalErrorCode.NO_AVAILABLE_ACCOUNT
        ) {
          setErrorMessage('Đã hết tài khoản khả dụng, vui lòng liên hệ quản trị viên.');
          return;
        }
        setErrorMessage('Đã có lỗi xảy ra, vui lòng thử lại sau.');
      }
    })();
  }, [assignAccount]);

  return (
    <div className='min-h-screen bg-[#FAF9F7] flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        {/* Brand */}
        <div className='flex flex-col items-center mb-8'>
          <div className='flex items-center gap-2.5 mb-3'>
            <BookIcon className='text-indigo-700 w-9 h-9' />
            <span className='font-bold text-2xl text-[#1C1917] tracking-tight'>CoursePilot</span>
          </div>
          <h1 className='text-[28px] font-semibold text-[#1C1917] text-center'>
            Tài khoản khảo sát của bạn
          </h1>
          <p className='text-gray-500 text-sm mt-1 text-center'>
            Sử dụng thông tin bên dưới để đăng nhập và tham gia khảo sát.
          </p>
        </div>

        {/* Card */}
        <div
          className='bg-white rounded-2xl px-8 py-8'
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)' }}
        >
          {isPending && !account && !errorMessage && (
            <div className='flex flex-col items-center gap-3 py-4'>
              <Spin />
              <span className='text-sm text-gray-500'>Đang lấy tài khoản...</span>
            </div>
          )}

          {errorMessage && <div className='text-sm text-red-600 text-center'>{errorMessage}</div>}

          {account && (
            <div className='flex flex-col gap-4'>
              <div>
                <div className='text-xs font-medium uppercase tracking-wide text-gray-500 mb-1'>
                  Tên đăng nhập
                </div>
                <div className='flex items-center justify-between rounded-lg border border-gray-200 bg-[#F2F0EB] px-3 py-2'>
                  <Typography.Text className='text-[15px] break-all'>
                    {account.username}
                  </Typography.Text>
                  <Typography.Text
                    copyable={{ text: account.username, tooltips: ['Sao chép', 'Đã sao chép'] }}
                  />
                </div>
              </div>
              <div>
                <div className='text-xs font-medium uppercase tracking-wide text-gray-500 mb-1'>
                  Mật khẩu
                </div>
                <div className='flex items-center justify-between rounded-lg border border-gray-200 bg-[#F2F0EB] px-3 py-2'>
                  <Typography.Text className='text-[15px]'>{account.password}</Typography.Text>
                  <Typography.Text
                    copyable={{ text: account.password, tooltips: ['Sao chép', 'Đã sao chép'] }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
