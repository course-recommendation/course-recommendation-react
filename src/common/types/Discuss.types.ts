import { Algorithm, Course } from './Course.types';
import { ListRequest } from './ListRequest.types';
import { User } from './User.types';

export type CreatePostRequest = {
  courseId: string;
  content: string;
};

export type PostDetail = {
  post: Post;
  user: User;
  course: Course;
};

export type Post = {
  id: number;
  userId: string;
  courseId: string;
  content: string;
};

export type PostComment = {
  id: number;
  postId: number;
  userId: string;
  content: string;
};

export type PostCommentDetail = {
  postComment: PostComment;
  user: User;
};

export type CreatePostCommentRequest = {
  content: string;
};

export type FindPostDetailsRequest = {
  algorithm: Algorithm;
  sort: string[];
  courseIdsRequest: ListRequest<string>;
};
