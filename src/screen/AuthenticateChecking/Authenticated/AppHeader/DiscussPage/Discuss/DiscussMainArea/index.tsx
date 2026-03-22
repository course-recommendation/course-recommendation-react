import useGet from '@/common/hooks/network/useGet';
import { Algorithm, Dataset } from '@/common/types/Course.types';
import { FindPostDetailsRequest, PostDetail } from '@/common/types/Discuss.types';
import { Empty, Skeleton } from 'antd';
import { ReactNode } from 'react';
import CreatePostCard from './CreatePostCard';
import PostCard from './PostCard';

type Props = {
  algorithm: Algorithm;
  dataset: Dataset;
  courseIds: string[];
  filterSection?: ReactNode;
};

export default function DiscussMainArea({ algorithm, dataset, courseIds, filterSection }: Props) {
  const {
    data: postDetailsResponse,
    isPending: postDetailsPending,
    refetch: refetchPosts,
  } = useGet<PostDetail[]>(`/posts`, {
    params: {
      sort: ['createdAt,desc'],
      domain: {
        algorithm,
        dataset,
      },
      courseIdsRequest: {
        fetchAll: courseIds.length === 0,
        data: courseIds,
      },
    } as FindPostDetailsRequest,
  });

  return (
    <div>
      <CreatePostCard
        afterPost={async () => {
          await refetchPosts();
        }}
        algorithm={algorithm}
        dataset={dataset}
      />
      <div className='my-6 md:my-10'></div>
      {filterSection && <div className='flex justify-end mb-4'>{filterSection}</div>}
      <div>
        {(() => {
          if (postDetailsPending) {
            return <Skeleton active />;
          }

          const postDetails = postDetailsResponse!.data;

          if (postDetails.length === 0) {
            return <Empty description='Hiện chưa có bài viết nào về môn học này' />;
          }

          return (
            <div className='flex flex-col gap-4 md:gap-5'>
              {postDetails.map((postDetail) => {
                return <PostCard key={postDetail.post.id} postDetail={postDetail} />;
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
