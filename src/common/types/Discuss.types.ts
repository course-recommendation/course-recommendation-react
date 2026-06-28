import { Algorithm, Course } from './Course.types';
import { ListRequest } from './ListRequest.types';
import { User } from './User.types';

export type VoteType = 'UPVOTE' | 'DOWNVOTE';

export type CreatePostRequest = {
  courseCode: string;
  content: string;
  algorithm: Algorithm;
};

export type PostDetail = {
  post: Post;
  user: User;
  course: Course;
  voteCount: number;
  userVote: VoteType | null;
};

export type Post = {
  id: number;
  userId: string;
  courseId: string;
  content: string;
  createdAt?: string;
};

export type PostComment = {
  id: number;
  postId: number;
  userId: string;
  content: string;
  parentCommentId?: number;
  createdAt?: string;
};

export type PostCommentDetail = {
  postComment: PostComment;
  user: User;
  voteCount: number;
  userVote: VoteType | null;
  replies: PostCommentDetail[];
};

export type CreatePostCommentRequest = {
  content: string;
  parentCommentId?: number;
};

export type FindPostDetailsRequest = {
  algorithm: Algorithm;
  sort: string[];
  courseIdsRequest: ListRequest<string>;
  authorIdsRequest?: ListRequest<string>;
};

export type VoteRequest = {
  voteType: VoteType;
};
