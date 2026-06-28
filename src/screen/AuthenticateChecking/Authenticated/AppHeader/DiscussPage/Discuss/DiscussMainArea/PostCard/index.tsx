import UserPopoverCardContent from '@/common/components/UserPopoverCard';
import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import RatingPopoverCard from '@/common/components/RatingPopoverCard';
import {
  CreatePostCommentRequest,
  PostCommentDetail,
  PostDetail,
  VoteRequest,
  VoteType,
} from '@/common/types/Discuss.types';
import { Algorithm } from '@/common/types/Course.types';
import { getUserFullName } from '@/common/types/User.types';
import { Avatar, Empty, Popover, Skeleton, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useState } from 'react';
import { Link } from 'react-router';
import ArrowUp from '@/assets/icons/ArrowUp';
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

  const handleReply = async (parentCommentId: number, text: string) => {
    await comment({
      method: 'post',
      url: `/posts/${postId}/comments`,
      data: { content: text, parentCommentId },
    });
    await refetch();
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
          className={`flex flex-col gap-2.5${expanded ? ' max-h-[400px] overflow-y-auto pr-1' : ''}`}
        >
          {commenting && <Spin className='flex justify-center' />}
          {visibleComments.map((c) => (
            <PostCommentItem
              key={c.postComment.id}
              postCommentDetail={c}
              postId={postId}
              onReply={handleReply}
            />
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
  const [voteCount, setVoteCount] = useState(postDetail.voteCount ?? 0);
  const [userVote, setUserVote] = useState<VoteType | null>(postDetail.userVote ?? null);

  const { request: voteRequest } = useRequest<void, VoteRequest>();

  const content = postDetail.post.content;
  const needsExpand = content.length > 200;
  const timestamp = postDetail.post.createdAt ? dayjs(postDetail.post.createdAt).locale('vi').fromNow() : null;

  const handleVote = async (voteType: VoteType) => {
    const prevCount = voteCount;
    const prevVote = userVote;

    if (userVote === voteType) {
      setUserVote(null);
      setVoteCount((c) => c + (voteType === 'UPVOTE' ? -1 : 1));
      try {
        await voteRequest({ method: 'delete', url: `/posts/${postDetail.post.id}/vote` });
      } catch {
        setVoteCount(prevCount);
        setUserVote(prevVote);
      }
    } else {
      const diff = voteType === 'UPVOTE' ? 1 : -1;
      const prevDiff = prevVote ? (prevVote === 'UPVOTE' ? -1 : 1) : 0;
      setVoteCount((c) => c + diff + prevDiff);
      setUserVote(voteType);
      try {
        await voteRequest({
          method: 'post',
          url: `/posts/${postDetail.post.id}/vote`,
          data: { voteType },
        });
      } catch {
        setVoteCount(prevCount);
        setUserVote(prevVote);
      }
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border border-[#E8E5E0] px-5 py-4 transition-all${isNew ? ' animate-[newPost_0.3s_ease-out]' : ''}`}
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.02)' }}
    >
      {/* Header */}
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2.5'>
          <Popover
            content={<UserPopoverCardContent user={postDetail.user} />}
            trigger='click'
            placement='bottomLeft'
            overlayInnerStyle={{ background: 'white', padding: 8 }}
          >
            <Avatar
              src={postDetail.user.avatarUrl}
              size={36}
              className='shrink-0 cursor-pointer'
            />
          </Popover>
          <div>
            <Popover
              content={<UserPopoverCardContent user={postDetail.user} />}
              trigger='click'
              placement='bottomLeft'
              overlayInnerStyle={{ background: 'white', padding: 8 }}
            >
              <Typography.Text
                strong
                className='text-sm leading-tight block cursor-pointer hover:text-indigo-700 transition-colors'
              >
                {getUserFullName(postDetail.user)}
              </Typography.Text>
            </Popover>
            {timestamp && (
              <span className='text-[11px] text-slate-400 mt-0.5 block'>{timestamp}</span>
            )}
          </div>
        </div>
        <div className='flex items-center gap-1.5 max-w-[45%]'>
          <Link to={`/courses/${postDetail.course.code}`} className='min-w-0'>
            <span className='block truncate rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs text-indigo-700 font-medium hover:bg-indigo-100 transition-colors'>
              {postDetail.course.name}
            </span>
          </Link>
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
            <span className='shrink-0 inline-flex items-center rounded-full bg-yellow-50 border border-yellow-300 px-1.5 py-1 text-xs font-medium text-yellow-400 cursor-default hover:bg-yellow-100 transition-colors'>
              ★
            </span>
          </Popover>
        </div>
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

      {/* Vote bar */}
      <div className='mt-3 flex items-center gap-0'>
        <button
          onClick={() => handleVote('UPVOTE')}
          className={`cursor-pointer flex items-center p-0.5 rounded transition-colors ${
            userVote === 'UPVOTE' ? 'text-primary' : 'text-slate-500 hover:text-primary'
          }`}
        >
          <ArrowUp width={20} height={20} fill='currentColor' filled={userVote === 'UPVOTE'} />
        </button>
        <span
          className={`text-sm font-bold min-w-5 text-center ${
            'text-slate-500'
          }`}
        >
          {voteCount}
        </span>
        <button
          onClick={() => handleVote('DOWNVOTE')}
          className={`cursor-pointer flex items-center p-0.5 rounded transition-colors ${
            userVote === 'DOWNVOTE' ? 'text-primary' : 'text-slate-500 hover:text-primary'
          }`}
        >
          <ArrowUp width={20} height={20} fill='currentColor' filled={userVote === 'DOWNVOTE'} className='rotate-180' />
        </button>
      </div>

      {/* Divider */}
      <div className='mt-3 border-t border-[#E8E5E0]' />

      <InlineComments postId={postDetail.post.id} />
    </div>
  );
}
