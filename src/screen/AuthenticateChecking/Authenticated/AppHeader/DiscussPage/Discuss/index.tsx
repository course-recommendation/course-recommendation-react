import useGet from "@/common/hooks/network/useGet";
import { CourseAlgorithm, CourseDataset } from "@/common/types/Course.types";
import { FindPostDetailsRequest, PostDetail } from "@/common/types/Discuss.types";
import { Skeleton } from "antd";
import CreatePostCard from "./CreatePostCard";
import PostCard from "./PostCard";

type Props = {
  algorithm: CourseAlgorithm;
  dataset: CourseDataset;
};

export default function Discuss({ algorithm, dataset }: Props) {
  const {
    data: postDetailsResponse,
    isPending: postDetailsPending,
    refetch: refetchPosts,
  } = useGet<PostDetail[]>(`/posts`, {
    params: {
      sort: ["createdAt,desc"],
      courseDomain: {
        algorithm,
        dataset,
      },
    } as FindPostDetailsRequest,
  });

  return (
    <div className="py-6 md:py-10 px-4 md:px-0">
      <div className="w-full md:w-3/4 lg:w-1/2 mx-auto">
        <CreatePostCard
          afterPost={async () => {
            await refetchPosts();
          }}
          algorithm={algorithm}
          dataset={dataset}
        />
        <div className="my-6 md:my-10"></div>
        <div>
          {(() => {
            if (postDetailsPending) {
              return <Skeleton active />;
            }

            const postDetails = postDetailsResponse!.data;

            return (
              <div className="flex flex-col gap-4 md:gap-5">
                {postDetails.map((postDetail) => {
                  return <PostCard key={postDetail.post.id} postDetail={postDetail} />;
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
