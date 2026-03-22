import useGet from '@/common/hooks/network/useGet';
import useRequest from '@/common/hooks/network/useRequest';
import {
  CreatePostCommentRequest,
  PostCommentDetail,
  PostDetail,
} from '@/common/types/Discuss.types';
import { getUserFullName } from '@/common/types/User.types';
import { Avatar, Card, Divider, Skeleton, Typography } from 'antd';
import { useState } from 'react';
import PostCommentSection from './PostCommentSection';

type Props = {
  postDetail: PostDetail;
};

export default function PostCard({ postDetail }: Props) {
  const {
    data: postCommentDetailsResponse,
    isPending: postCommentDetailsPending,
    refetch: refetchPostCommentDetails,
  } = useGet<PostCommentDetail[]>(`/posts/${postDetail.post.id}/comments`);

  const { request: comment } = useRequest<void, CreatePostCommentRequest>();

  const [commenting, setCommenting] = useState(false);

  return (
    <Card className='shadow' styles={{ body: { padding: '12px 15px' } }}>
      <div>
        <div className='flex justify-between items-center gap-3'>
          <div className='flex items-center'>
            <Avatar
              src={postDetail.user.avatarUrl}
              size={{ xs: 32, sm: 40 }}
              className='shrink-0'
            />
            <div className='mx-1'></div>
            <Typography.Text strong className='text-sm sm:text-base line-clamp-1'>
              {getUserFullName(postDetail.user)}
            </Typography.Text>
          </div>
          <div className='max-w-[50%]'>
            <div className='text-sm md:text-base line-clamp-1 bg-primary text-white px-2 rounded'>
              {postDetail.course.name}
            </div>
          </div>
        </div>
        <div className='my-3'></div>
        <div>
          <Typography.Text className='whitespace-pre-wrap text-sm sm:text-base wrap-break-words'>
            {postDetail.post.content}
          </Typography.Text>
        </div>
      </div>
      <Divider className='mt-2 mb-3 md:mb-4' />
      <div>
        {(() => {
          if (postCommentDetailsPending) {
            return <Skeleton active />;
          }

          const postCommentDetails = postCommentDetailsResponse!.data;

          return (
            <PostCommentSection
              postCommentDetails={postCommentDetails}
              commenting={commenting}
              onComment={async (text) => {
                setCommenting(true);

                await comment({
                  method: 'post',
                  url: `/posts/${postDetail.post.id}/comments`,
                  data: {
                    content: text,
                  },
                });

                await refetchPostCommentDetails();

                setCommenting(false);
              }}
            />
          );
        })()}
      </div>
    </Card>
  );
}
