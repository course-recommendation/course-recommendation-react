import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import {
  CreatePostCommentRequest,
  PostCommentDetail,
  PostDetail,
} from '@/common/types/Discuss.types';
import { getUserFullName } from '@/common/types/User.types';
import { LikeOutlined, MessageOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Avatar, Button, Skeleton, Typography } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useState } from 'react';
import { Link } from 'react-router';
import PostCommentSection from './PostCommentSection';

dayjs.extend(relativeTime);
dayjs.locale('vi');

type Props = {
  postDetail: PostDetail;
  isNew?: boolean;
};

function LazyCommentSection({ postId }: { postId: number }) {
  const {
    data: postCommentDetailsResponse,
    isPending: postCommentDetailsPending,
    refetch: refetchPostCommentDetails,
  } = useGet<PostCommentDetail[]>(`/posts/${postId}/comments`);

  const { request: comment } = useRequest<void, CreatePostCommentRequest>();
  const [commenting, setCommenting] = useState(false);

  if (postCommentDetailsPending) {
    return <Skeleton active paragraph={{ rows: 2 }} />;
  }

  return (
    <PostCommentSection
      postCommentDetails={postCommentDetailsResponse!.data}
      commenting={commenting}
      onComment={async (text) => {
        setCommenting(true);
        await comment({
          method: 'post',
          url: `/posts/${postId}/comments`,
          data: { content: text },
        });
        await refetchPostCommentDetails();
        setCommenting(false);
      }}
    />
  );
}

export default function PostCard({ postDetail, isNew }: Props) {
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const content = postDetail.post.content;
  const needsExpand = content.length > 200;

  const timestamp = postDetail.post.createdAt ? dayjs(postDetail.post.createdAt).fromNow() : null;

  return (
    <div
      className={`bg-white rounded-xl border border-[#E8E5E0] px-5 py-4 transition-all${isNew ? ' animate-[newPost_0.3s_ease-out]' : ''}`}
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.02)' }}
    >
      {/* Header */}
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2.5'>
          <Avatar src={postDetail.user.avatarUrl} size={36} className='shrink-0' />
          <div>
            <Typography.Text strong className='text-sm leading-tight block'>
              {getUserFullName(postDetail.user)}
            </Typography.Text>
            {timestamp && (
              <span className='text-[11px] text-slate-400 mt-0.5 block'>{timestamp}</span>
            )}
          </div>
        </div>
        <Link to={`/courses/${postDetail.course.code}`} className='max-w-[45%]'>
          <span className='block truncate rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs text-indigo-700 font-medium hover:bg-indigo-100 transition-colors'>
            {postDetail.course.name}
          </span>
        </Link>
      </div>

      {/* Body */}
      <div className='mt-3'>
        <Typography.Text
          className={`text-[16px] text-[#1C1917] leading-[1.75] whitespace-pre-wrap break-words${!isExpanded && needsExpand ? ' line-clamp-3' : ''}`}
        >
          {content}
        </Typography.Text>
        {needsExpand && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className='mt-0.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 block'
          >
            Xem thêm
          </button>
        )}
      </div>

      {/* Divider */}
      <div className='mt-4 border-t border-[#E8E5E0]' />

      {/* Reactions row */}
      <div className='mt-1 flex gap-0.5'>
        <Button
          type='text'
          icon={<LikeOutlined />}
          className='text-slate-500 hover:!text-slate-700 hover:!bg-slate-50 rounded-lg text-sm font-normal'
          size='small'
        >
          Thích
        </Button>
        <Button
          type='text'
          icon={<MessageOutlined />}
          onClick={() => setShowComments((v) => !v)}
          className={`rounded-lg text-sm font-normal ${showComments ? '!text-indigo-600 !bg-indigo-50' : 'text-slate-500 hover:!text-slate-700 hover:!bg-slate-50'}`}
          size='small'
        >
          Bình luận
        </Button>
        <Button
          type='text'
          icon={<ShareAltOutlined />}
          className='text-slate-500 hover:!text-slate-700 hover:!bg-slate-50 rounded-lg text-sm font-normal'
          size='small'
        >
          Chia sẻ
        </Button>
      </div>

      {/* Comments — lazy loaded */}
      {showComments && (
        <div className='mt-3 border-t border-[#E8E5E0] pt-3'>
          <LazyCommentSection postId={postDetail.post.id} />
        </div>
      )}
    </div>
  );
}
