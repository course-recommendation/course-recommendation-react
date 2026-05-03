import { SettingOutlined } from '@ant-design/icons';
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
        className='hidden md:flex md:w-[400px] flex-col gap-3 md:shrink-0'
        styles={{
          body: {
            overflow: 'hidden',
          },
        }}
      >
        <div className='flex flex-col h-full gap-5'>
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
        title='Cài đặt gợi ý'
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
