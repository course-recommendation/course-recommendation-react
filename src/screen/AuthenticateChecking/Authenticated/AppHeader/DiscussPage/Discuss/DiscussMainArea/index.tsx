import { Algorithm } from '@/common/types/Course.types';
import { PostDetail } from '@/common/types/Discuss.types';
import { Empty, Skeleton, Spin } from 'antd';
import { useInViewport } from 'ahooks';
import { ReactNode, useEffect, useRef } from 'react';
import CreatePostCard from './CreatePostCard';
import PostCard from './PostCard';

type Props = {
  algorithm: Algorithm;
  postDetails: PostDetail[] | undefined;
  postDetailsPending: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetchPosts: () => Promise<unknown>;
  filterSection?: ReactNode;
};

export default function DiscussMainArea({
  algorithm,
  postDetails,
  postDetailsPending,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  refetchPosts,
  filterSection,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [sentinelInViewport] = useInViewport(sentinelRef);

  useEffect(() => {
    if (sentinelInViewport && hasNextPage && !postDetailsPending && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [sentinelInViewport, hasNextPage, postDetailsPending, isFetchingNextPage, fetchNextPage]);

  return (
    <div className='space-y-4 md:space-y-6'>
      <CreatePostCard
        afterPost={async () => {
          await refetchPosts();
        }}
        algorithm={algorithm}
      />
      {filterSection && <div className='flex justify-end'>{filterSection}</div>}
      <div>
        {(() => {
          if (postDetailsPending) {
            return <Skeleton active />;
          }

          if (!postDetails || postDetails.length === 0) {
            return <Empty description='Không có bài viết nào' />;
          }

          return (
            <div className='flex flex-col gap-4 md:gap-5'>
              {postDetails.map((postDetail) => (
                <PostCard key={postDetail.post.id} postDetail={postDetail} algorithm={algorithm} />
              ))}

              <div ref={sentinelRef} className='flex justify-center py-4'>
                {isFetchingNextPage && <Spin size='small' />}
                {!hasNextPage && !isFetchingNextPage && (
                  <span className='text-xs text-slate-400'>Đã hết bài viết</span>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
