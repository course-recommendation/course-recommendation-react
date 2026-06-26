import { Algorithm } from '@/common/types/Course.types';
import { PostDetail } from '@/common/types/Discuss.types';
import { Empty, Skeleton } from 'antd';
import { ReactNode } from 'react';
import CreatePostCard from './CreatePostCard';
import PostCard from './PostCard';

type Props = {
  algorithm: Algorithm;
  postDetails: PostDetail[] | undefined;
  postDetailsPending: boolean;
  refetchPosts: () => Promise<unknown>;
  filterSection?: ReactNode;
};

export default function DiscussMainArea({
  algorithm,
  postDetails,
  postDetailsPending,
  refetchPosts,
  filterSection,
}: Props) {
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
            return <Empty description='Hiện chưa có bài viết nào về môn học này' />;
          }

          return (
            <div className='flex flex-col gap-4 md:gap-5'>
              {postDetails.map((postDetail) => (
                <PostCard key={postDetail.post.id} postDetail={postDetail} algorithm={algorithm} />
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
