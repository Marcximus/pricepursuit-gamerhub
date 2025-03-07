
export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: 'Top10' | 'Review' | 'Comparison' | 'How-To';
  image_url?: string;
  additional_images?: string[];
  author: string;
  created_at: string;
  updated_at?: string;
  published: boolean;
  tags?: string[];
};

export interface BlogContextType {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  getPostBySlug: (slug: string, category: string) => BlogPost | undefined;
  getPostsByCategory: (category: string) => BlogPost[];
  getRecentPosts: (limit?: number) => BlogPost[];
  createPost: (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => Promise<BlogPost | null>;
  updatePost: (id: string, post: Partial<BlogPost>) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
}
