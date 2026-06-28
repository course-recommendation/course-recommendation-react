import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import useGet from '@/common/hooks/network/useGet';
import { FindPostDetailsRequest } from '@/common/types/Discuss.types';
import { User } from '@/common/types/User.types';
import { Avatar, Skeleton } from 'antd';
import { useSearchParams } from 'react-router';

function UserPopoverCardContent({ user }: { user: User }) {
  const algorithm = useAlgorithmContext();
  const [, setSearchParams] = useSearchParams();

  const { data: postsResponse, isPending } = useGet<unknown[]>('/posts', {
    params: {
      algorithm,
      sort: ['createdAt,desc'],
      courseIdsRequest: { fetchAll: true, data: [] },
      authorIdsRequest: { fetchAll: false, data: [user.id] },
    } as FindPostDetailsRequest,
  });

  const postCount = postsResponse?.data?.length ?? 0;

  const filterByAuthor = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('authorIds', user.id);
      next.delete('courseCodes');
      return next;
    }, { replace: true });
  };

  return (
    <div className='flex items-start gap-3 p-1 min-w-[200px] max-w-[260px]'>
      <Avatar src={user.avatarUrl} size={44} className='shrink-0' />
      <div className='min-w-0'>
        <p className='text-sm font-semibold text-[#1C1917] leading-tight'>{user.fullName}</p>
        <p className='text-xs text-slate-400 mt-0.5 truncate'>{user.email}</p>
        {isPending ? (
          <Skeleton.Button active size='small' className='mt-1.5 !h-4 !min-w-[60px]' />
        ) : (
          <button
            onClick={filterByAuthor}
            className='mt-1.5 text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-medium cursor-pointer'
          >
            {postCount} bài viết
          </button>
        )}
      </div>
    </div>
  );
}

export function LazyUserPopoverCard({ userId }: { userId: string }) {
  const { data, isPending } = useGet<User>(`/users/${userId}`);

  if (isPending) {
    return (
      <div className='p-2 min-w-[200px]'>
        <Skeleton active avatar={{ size: 44 }} paragraph={{ rows: 2 }} title={false} />
      </div>
    );
  }

  if (!data?.data) return null;
  return <UserPopoverCardContent user={data.data} />;
}

export default UserPopoverCardContent;
