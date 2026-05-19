import { PostCommentDetail } from '@/common/types/Discuss.types';
import { getUserFullName } from '@/common/types/User.types';
import { Avatar, Typography } from 'antd';

type Props = {
  postCommentDetail: PostCommentDetail;
};

export default function PostCommentItem({ postCommentDetail }: Props) {
  return (
    <div className='flex gap-2'>
      <Avatar src={postCommentDetail.user.avatarUrl} size={{ xs: 32, sm: 36, md: 40 }} />
      <div className='max-w-[85%] rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-2 sm:max-w-[80%] sm:rounded-3xl sm:px-4'>
        <Typography.Text strong className='text-sm sm:text-base'>
          {getUserFullName(postCommentDetail.user)}
        </Typography.Text>
        <div className='my-0' />
        <Typography.Text className='whitespace-pre-line text-sm text-slate-700 sm:text-base break-words'>
          {postCommentDetail.postComment.content}
        </Typography.Text>
      </div>
    </div>
  );
}
