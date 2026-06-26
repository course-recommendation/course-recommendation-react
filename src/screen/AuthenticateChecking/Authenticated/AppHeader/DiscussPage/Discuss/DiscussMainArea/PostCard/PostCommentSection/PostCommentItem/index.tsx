import { PostCommentDetail } from '@/common/types/Discuss.types';
import { getUserFullName } from '@/common/types/User.types';
import { Avatar, Typography } from 'antd';

type Props = {
  postCommentDetail: PostCommentDetail;
};

export default function PostCommentItem({ postCommentDetail }: Props) {
  return (
    <div className='flex gap-2'>
      <Avatar src={postCommentDetail.user.avatarUrl} size={32} />
      <div className='max-w-[85%] rounded-xl bg-[#F1F2F5] px-3 py-2'>
        <Typography.Text strong className='text-[14px] leading-tight block'>
          {getUserFullName(postCommentDetail.user)}
        </Typography.Text>
        <Typography.Text className='whitespace-pre-line break-words'>
          {postCommentDetail.postComment.content}
        </Typography.Text>
      </div>
    </div>
  );
}
