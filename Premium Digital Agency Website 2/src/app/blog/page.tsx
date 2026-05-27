import { getPublicBlogPosts } from "@/lib/content";
import { Blog } from "../pages/Blog";

export default async function Page() {
  const posts = await getPublicBlogPosts();

  return <Blog posts={posts} />;
}
