import { useMeContext } from '@/screen/AuthenticateChecking/Authenticated/context/MeContext';
import { SendOutlined } from '@ant-design/icons';
import { Avatar, Button, Input } from 'antd';
import { useState } from 'react';

type Props = {
  onComment: (text: string) => void;
};

export default function PostCommentInput({ onComment }: Props) {
  const { me } = useMeContext();

  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;

    onComment(text);

    setText('');
  };

  return (
    <div className='flex gap-2 items-center'>
      <Avatar src={me.avatarUrl} size={{ xs: 32, sm: 36, md: 40 }} className='shrink-0' />
      <div className='relative w-full'>
        <Input.TextArea
          className='w-full rounded-2xl border-slate-200 bg-slate-50/90 pr-12'
          autoSize={{ minRows: 1, maxRows: 6 }}
          placeholder='Bình luận...'
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        <Button
          type='text'
          icon={<SendOutlined className='text-sm md:text-base' />}
          disabled={!text.trim()}
          onClick={handleSubmit}
          className='absolute bottom-0.5 right-1 flex h-8 w-8 items-center justify-center rounded-full text-indigo-500 enabled:hover:bg-indigo-50 enabled:hover:text-indigo-600 md:right-2'
        />
      </div>
    </div>
  );
}
