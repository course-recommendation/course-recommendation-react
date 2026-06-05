import { SettingOutlined, SlidersOutlined } from '@ant-design/icons';
import { Button, Card, Drawer } from 'antd';
import { ReactNode } from 'react';

type Props = {
  settingsForm: ReactNode;
  recommendButton: ReactNode;
  settingsDrawerOpen: boolean;
  setSettingsDrawerOpen: (open: boolean) => void;
};

export default function RecommendationSettingsSidebar({
  settingsForm,
  recommendButton,
  settingsDrawerOpen,
  setSettingsDrawerOpen,
}: Props) {
  return (
    <>
      <Card
        variant='borderless'
        className='hidden md:flex md:w-[360px] flex-col gap-3 md:shrink-0'
        styles={{
          body: {
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '20px',
          },
        }}
      >
        {/* Sidebar header */}
        <div className='shrink-0 mb-4'>
          <div className='flex items-center gap-2 mb-1'>
            <SlidersOutlined className='text-indigo-600 text-base' />
            <span className='text-[17px] font-semibold text-[#1C1917] tracking-tight'>
              Cài đặt gợi ý
            </span>
          </div>
          <div className='w-8 h-[2px] rounded-full bg-indigo-600 ml-6'></div>
        </div>

        <div className='flex flex-col h-full gap-4 min-h-0'>
          <div className='flex-1 overflow-auto overscroll-none'>{settingsForm}</div>
          {recommendButton}
        </div>
      </Card>

      <Button
        className='md:hidden w-full'
        type='primary'
        icon={<SettingOutlined />}
        onClick={() => setSettingsDrawerOpen(true)}
        size='large'
      >
        Cài đặt gợi ý
      </Button>

      <Drawer
        title={
          <div className='flex items-center gap-2'>
            <SlidersOutlined className='text-indigo-600' />
            <span>Cài đặt gợi ý</span>
          </div>
        }
        placement='bottom'
        onClose={() => setSettingsDrawerOpen(false)}
        open={settingsDrawerOpen}
        size={'large'}
        className='md:hidden'
      >
        {settingsForm}
        <div className='my-5'></div>
        {recommendButton}
      </Drawer>
    </>
  );
}
