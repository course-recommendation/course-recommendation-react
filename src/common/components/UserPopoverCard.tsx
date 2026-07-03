import { useAlgorithmContext } from '@/common/context/AlgorithmContext';
import useGet from '@/common/hooks/network/useGet';
import { FindPostDetailsRequest } from '@/common/types/Discuss.types';
import { PageResponse } from '@/common/types/Network';
import { User } from '@/common/types/User.types';
import { Avatar, Skeleton } from 'antd';
import { Link } from 'react-router';

function UserPopoverCardContent({ user }: { user: User }) {
  const algorithm = useAlgorithmContext();

  const { data: postsResponse, isPending } = useGet<PageResponse<unknown>>('/posts', {
    params: {
      algorithm,
      sort: ['createdAt,desc'],
      page: 0,
      size: 1,
      courseIdsRequest: { fetchAll: true, data: [] },
      authorIdsRequest: { fetchAll: false, data: [user.id] },
    } as FindPostDetailsRequest & { page: number; size: number },
  });

  const postCount = postsResponse?.data?.totalElements ?? 0;

  return (
    <div className='flex items-start gap-3 p-1 min-w-[200px] max-w-[260px]'>
      <Avatar src={user.avatarUrl} size={44} className='shrink-0' />
      <div className='min-w-0'>
        <p className='text-sm font-semibold text-[#1C1917] leading-tight'>{user.fullName}</p>
        <p className='text-xs text-slate-400 mt-0.5 truncate'>{user.email}</p>
        {isPending ? (
          <Skeleton.Button active size='small' className='mt-1.5 !h-4 !min-w-[60px]' />
        ) : (
          postCount > 0 && (
            <Link
              to={`/discuss?authorIds=${user.id}`}
              className='mt-1.5 text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-medium block'
            >
              {postCount} bài viết
            </Link>
          )
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
