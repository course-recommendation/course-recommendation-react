import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import RatingPopoverCard from '@/common/components/RatingPopoverCard';
import {
  CreatePostCommentRequest,
  PostCommentDetail,
  PostDetail,
} from '@/common/types/Discuss.types';
import { Algorithm } from '@/common/types/Course.types';
import { getUserFullName } from '@/common/types/User.types';
import { Avatar, Empty, Popover, Skeleton, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useState } from 'react';
import { Link } from 'react-router';
import PostCommentInput from './PostCommentSection/PostCommentInput';
import PostCommentItem from './PostCommentSection/PostCommentItem';

dayjs.extend(relativeTime);
dayjs.locale('vi');

type Props = {
  postDetail: PostDetail;
  isNew?: boolean;
  algorithm: Algorithm;
};

function InlineComments({ postId }: { postId: number }) {
  const {
    data: postCommentDetailsResponse,
    isPending,
    refetch,
  } = useGet<PostCommentDetail[]>(`/posts/${postId}/comments`);

  const { request: comment } = useRequest<void, CreatePostCommentRequest>();
  const [commenting, setCommenting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleComment = async (text: string) => {
    setCommenting(true);
    await comment({
      method: 'post',
      url: `/posts/${postId}/comments`,
      data: { content: text },
    });
    await refetch();
    setCommenting(false);
  };

  if (isPending) {
    return (
      <div className='mt-3'>
        <Skeleton active paragraph={{ rows: 2 }} title={false} />
      </div>
    );
  }

  const comments = postCommentDetailsResponse!.data;
  const visibleComments = expanded ? comments : comments.slice(0, 3);

  return (
    <div className='mt-3'>
      {comments.length === 0 && !commenting ? (
        <Empty description='Chưa có bình luận nào' className='py-2' />
      ) : (
        <div
          className={`flex flex-col gap-2${expanded ? ' max-h-[360px] overflow-y-auto pr-1' : ''}`}
        >
          {commenting && <Spin className='flex justify-center' />}
          {visibleComments.map((c) => (
            <PostCommentItem key={c.postComment.id} postCommentDetail={c} />
          ))}
        </div>
      )}

      {comments.length > 3 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className='mt-3 flex w-full cursor-pointer items-center gap-3 text-sm font-medium text-slate-400 hover:text-indigo-600 transition-colors'
        >
          <span className='h-px flex-1 bg-slate-200' />
          {`Xem tất cả ${comments.length} bình luận`}
          <span className='h-px flex-1 bg-slate-200' />
        </button>
      )}

      <div className='mt-3'>
        <PostCommentInput onComment={handleComment} />
      </div>
    </div>
  );
}

export default function PostCard({ postDetail, isNew, algorithm }: Props) {
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
        <Popover
          trigger='hover'
          placement='bottomRight'
          overlayInnerStyle={{ background: 'white' }}
          content={
            <RatingPopoverCard
              courseId={postDetail.course.id}
              courseCode={postDetail.course.code}
              algorithm={algorithm}
            />
          }
        >
          <Link to={`/courses/${postDetail.course.code}`} className='max-w-[45%]'>
            <span className='block truncate rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs text-indigo-700 font-medium hover:bg-indigo-100 transition-colors'>
              {postDetail.course.name}
            </span>
          </Link>
        </Popover>
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

      <InlineComments postId={postDetail.post.id} />
    </div>
  );
}
