import { PostCommentDetail } from "@/common/types/Discuss.types";
import { getUserFullName } from "@/common/types/User.types";
import { Avatar, Typography } from "antd";

type Props = {
  postCommentDetail: PostCommentDetail;
};

export default function PostCommentItem({ postCommentDetail }: Props) {
  return (
    <div className="flex gap-2">
      <Avatar src={postCommentDetail.user.avatarUrl} size={{ xs: 32, sm: 36, md: 40 }} />
      <div className="bg-[#F0F2F5] rounded-2xl sm:rounded-3xl px-3 py-2 sm:px-4 max-w-[85%] sm:max-w-[80%]">
        <Typography.Text strong className="text-sm sm:text-base">
          {getUserFullName(postCommentDetail.user)}
        </Typography.Text>
        <div className="my-0"></div>
        <Typography.Text className="whitespace-pre-line text-sm sm:text-base wrap-break-words">
          {postCommentDetail.postComment.content}
        </Typography.Text>
      </div>
    </div>
  );
}
