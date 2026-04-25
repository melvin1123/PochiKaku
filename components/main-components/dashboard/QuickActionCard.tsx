import Link from "next/link";
import type { IconType } from "react-icons";

type QuickActionCardProps = {
  title: string;
  Icon: IconType;
  link?: string;
  onClick?: () => void;
};

export default function QuickActionCard({
  title,
  Icon,
  link,
  onClick,
}: QuickActionCardProps) {
  const baseClass =
    "flex flex-col items-center justify-center p-6 bg-[#e8dfd3] rounded-lg shadow hover:bg-[#5a4636] hover:text-[#f5efe6] transition cursor-pointer";

  if (link) {
    return (
      <Link href={link} className={baseClass}>
        <Icon size={24} />
        <span className="mt-2 text-center font-semibold">{title}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={baseClass}
    >
      <Icon size={24} />
      <span className="mt-2 text-center font-semibold">{title}</span>
    </button>
  );
}