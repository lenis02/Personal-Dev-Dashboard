import { User } from './user.model';

export enum PostCategory {
  DEBATE = 'DEBATE',
  WORKOUT = 'WORKOUT',
  NOTICE = 'NOTICE',
}

export interface Post {
  id: number;
  authorId: number;
  category: PostCategory;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  author?: User;
}
