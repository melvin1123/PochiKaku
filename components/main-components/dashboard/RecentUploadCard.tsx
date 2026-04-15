import Image from "next/image";
import { FaHeart, FaComment } from "react-icons/fa";

type Post = {
  image: string;
  title: string;
  likes: number;
  comments: number;
};

export default function RecentUploadCard({ post }: { post: Post }) {
  return (
    <div className="w-60 bg-[#f5efe6] rounded-2xl shadow-md hover:shadow-lg overflow-hidden flex flex-col">

      {/* Title / Caption */}
      <div className="p-3 flex-none border-b border-[#e8dfd3]">
        <p className="text-[#3e2c23] font-semibold text-base">{post.title}</p>
      </div>

      {/* IMAGE */}
      <div className="relative h-65 w-full">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-contain"
        />
      </div>

      {/* BOTTOM: Likes & Comments */}
      <div className="p-3 flex-none border-t border-[#e8dfd3]">
        <div className="flex gap-5 text-[#3e2c23] text-base">
          <span className="flex items-center gap-1">
            <FaHeart size={18} /> {post.likes} Likes
          </span>
          <span className="flex items-center gap-1">
            <FaComment size={18} /> {post.comments} Comments
          </span>
        </div>
      </div>

    </div>
  );
}