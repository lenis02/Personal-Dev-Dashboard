export interface Comment {
  id: number;
  authorId: number;
  postId: number;
  content: string;
  likes: number;
  createdAt: Date;
}