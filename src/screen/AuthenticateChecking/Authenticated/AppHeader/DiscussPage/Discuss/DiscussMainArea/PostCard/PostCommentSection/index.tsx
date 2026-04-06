import { PostCommentDetail } from '@/common/types/Discuss.types';
import { Empty, Spin } from 'antd';
import PostCommentInput from './PostCommentInput';
import PostCommentItem from './PostCommentItem';

type Props = {
  postCommentDetails: PostCommentDetail[];
  commenting?: boolean;
  onComment: (text: string) => void;
};

export default function PostCommentSection({ postCommentDetails, commenting, onComment }: Props) {
  return (
    <div>
      {postCommentDetails.length === 0 && !commenting ? (
        <Empty description='Chưa có bình luận nào' className='text-sm md:text-base' />
      ) : (
        <div className='flex flex-col gap-3 max-h-[500px] overflow-y-scroll overscroll-none'>
          {postCommentDetails.map((postCommentDetail) => {
            return (
              <PostCommentItem
                key={postCommentDetail.postComment.id}
                postCommentDetail={postCommentDetail}
              />
            );
          })}
        </div>
      )}
      {commenting && <Spin className='mt-3 flex justify-center' />}
      <div className='my-4'></div>
      <PostCommentInput onComment={onComment} />
    </div>
  );
}
