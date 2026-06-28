import UserPopoverCardContent, { LazyUserPopoverCard } from '@/common/components/UserPopoverCard';
import useRequest from '@/common/hooks/network/useRequest';
import { PostCommentDetail, VoteRequest, VoteType } from '@/common/types/Discuss.types';
import { getUserFullName } from '@/common/types/User.types';
import { Avatar, Popover } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { Fragment, useState } from 'react';
import ArrowUp from '@/assets/icons/ArrowUp';
import PostCommentInput from '../PostCommentInput';

dayjs.extend(relativeTime);
dayjs.locale('vi');

type Props = {
  postCommentDetail: PostCommentDetail;
  postId: number;
  onReply?: (parentCommentId: number, text: string) => Promise<void>;
  isReply?: boolean;
  onReplyClick?: () => void;
};

function renderContent(content: string) {
  const regex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <Fragment key={`text-${lastIndex}`}>{content.slice(lastIndex, match.index)}</Fragment>,
      );
    }
    const [, name, userId] = match;
    parts.push(
      <Popover
        key={`mention-${match.index}`}
        content={<LazyUserPopoverCard userId={userId} />}
        trigger='click'
        placement='bottomLeft'
        overlayInnerStyle={{ background: 'white', padding: 8 }}
      >
        <span className='text-indigo-600 font-medium cursor-pointer hover:underline'>@{name}</span>
      </Popover>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(<Fragment key={`text-end`}>{content.slice(lastIndex)}</Fragment>);
  }

  return parts.length > 0 ? parts : [content];
}

export default function PostCommentItem({
  postCommentDetail,
  postId,
  onReply,
  isReply = false,
  onReplyClick,
}: Props) {
  const { postComment, user, replies = [] } = postCommentDetail;

  const [voteCount, setVoteCount] = useState(postCommentDetail.voteCount ?? 0);
  const [userVote, setUserVote] = useState<VoteType | null>(postCommentDetail.userVote ?? null);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [repliesExpanded, setRepliesExpanded] = useState(false);

  const { request: voteRequest } = useRequest<void, VoteRequest>();

  const timestamp = postComment.createdAt ? dayjs(postComment.createdAt).fromNow() : null;

  const handleVote = async (voteType: VoteType) => {
    const prevCount = voteCount;
    const prevVote = userVote;

    if (userVote === voteType) {
      setUserVote(null);
      setVoteCount((c) => c + (voteType === 'UPVOTE' ? -1 : 1));
      try {
        await voteRequest({
          method: 'delete',
          url: `/posts/${postId}/comments/${postComment.id}/vote`,
        });
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
          url: `/posts/${postId}/comments/${postComment.id}/vote`,
          data: { voteType },
        });
      } catch {
        setVoteCount(prevCount);
        setUserVote(prevVote);
      }
    }
  };

  const handleReply = async (text: string) => {
    if (!onReply) return;
    setReplyLoading(true);
    try {
      await onReply(postComment.id, text);
      setShowReplyInput(false);
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className={`flex gap-2 ${isReply ? '' : ''}`}>
      <Popover
        content={<UserPopoverCardContent user={user} />}
        trigger='click'
        placement='bottomLeft'
        overlayInnerStyle={{ background: 'white', padding: 8 }}
      >
        <Avatar src={user.avatarUrl} size={isReply ? 26 : 32} className='shrink-0 cursor-pointer mt-0.5' />
      </Popover>

      <div className='flex-1 min-w-0'>
        {/* Comment bubble */}
        <div className='inline-block max-w-full rounded-xl bg-[#F1F2F5] px-3 py-2'>
          <Popover
            content={<UserPopoverCardContent user={user} />}
            trigger='click'
            placement='bottomLeft'
            overlayInnerStyle={{ background: 'white', padding: 8 }}
          >
            <span className='text-[13px] font-semibold text-[#1C1917] leading-tight block cursor-pointer hover:underline'>
              {getUserFullName(user)}
            </span>
          </Popover>
          <p className='text-sm text-[#1C1917] whitespace-pre-wrap break-words leading-relaxed mt-0.5'>
            {renderContent(postComment.content)}
          </p>
        </div>

        {/* Action bar */}
        <div className='flex items-center gap-3 mt-1 ml-1'>
          {/* Vote buttons */}
          <div className='flex items-center gap-0.5'>
            <button
              onClick={() => handleVote('UPVOTE')}
              className={`cursor-pointer flex items-center p-0.5 rounded transition-colors ${
                userVote === 'UPVOTE' ? 'text-primary' : 'text-slate-500 hover:text-primary'
              }`}
            >
              <ArrowUp width={16} height={16} fill='currentColor' filled={userVote === 'UPVOTE'} />
            </button>
            <span
              className={`text-xs font-semibold min-w-[14px] text-center ${
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
              <ArrowUp width={16} height={16} fill='currentColor' filled={userVote === 'DOWNVOTE'} className='rotate-180' />
            </button>
          </div>

          {/* Timestamp */}
          {timestamp && (
            <span className='text-[11px] text-slate-400'>{timestamp}</span>
          )}

          {/* Reply button */}
          {((!isReply && onReply) || (isReply && onReplyClick)) && (
            <button
              onClick={() => isReply ? onReplyClick!() : setShowReplyInput((v) => !v)}
              className='text-[11px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer'
            >
              Trả lời
            </button>
          )}

          {/* View replies button */}
          {!isReply && !repliesExpanded && replies.length > 0 && (
            <button
              onClick={() => setRepliesExpanded(true)}
              className='text-[11px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer'
            >
              Xem {replies.length} phản hồi
            </button>
          )}
        </div>

        {/* Reply input */}
        {showReplyInput && !isReply && (
          <div className='mt-2 ml-1'>
            <PostCommentInput
              onComment={handleReply}
              placeholder={`Trả lời ${getUserFullName(user)}...`}
              autoFocus
            />
            {replyLoading && (
              <p className='text-xs text-slate-400 mt-1 ml-10'>Đang gửi...</p>
            )}
          </div>
        )}

        {/* Nested replies */}
        {!isReply && repliesExpanded && replies.length > 0 && (
          <div className='mt-2 ml-1 flex flex-col gap-2 pl-3 border-l-2 border-[#E8E5E0]'>
            {replies.map((reply) => (
              <PostCommentItem
                key={reply.postComment.id}
                postCommentDetail={reply}
                postId={postId}
                isReply
                onReplyClick={() => setShowReplyInput(true)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
