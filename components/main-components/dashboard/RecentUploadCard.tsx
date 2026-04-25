import Image from "next/image";
import { FaHeart, FaComment, FaPlus } from "react-icons/fa";
import type { PostItem } from "@/app/types/post";

type RecentUploadCardProps = {
  post?: PostItem;
  isEmptyCard?: boolean;
  onAddClick?: () => void;
};

export default function RecentUploadCard({
  post,
  isEmptyCard = false,
  onAddClick,
}: RecentUploadCardProps) {
  if (isEmptyCard) {
    return (
      <button
        type="button"
        onClick={onAddClick}
        disabled={!onAddClick}
        className="flex min-h-70 w-55 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d7cab9] bg-[#f7f4f0] text-[#5a4636] shadow-md transition hover:border-[#8b6b4f] hover:bg-[#f3ede6] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8dfd3]">
          <FaPlus size={24} />
        </div>

        <p className="mt-4 text-base font-semibold text-[#3e2c23]">
          Upload Your First Art
        </p>

        <p className="mt-1 px-6 text-center text-sm text-[#5a4636]">
          Share your work with the community.
        </p>
      </button>
    );
  }

  if (!post) return null;

  return (
    <div className="flex w-60 flex-col overflow-hidden rounded-2xl bg-[#f7f4f0] shadow-md hover:shadow-lg">
      <div className="flex-none border-b border-[#e8dfd3] p-3">
        <p className="text-base font-semibold text-[#3e2c23]">{post.title}</p>
      </div>

      <div className="relative h-65 w-full">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-contain"
          sizes="240px"
        />
      </div>

      <div className="flex-none border-t border-[#e8dfd3] p-3">
        <div className="flex gap-5 text-base text-[#3e2c23]">
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