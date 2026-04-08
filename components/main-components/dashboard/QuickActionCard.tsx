export default function QuickActionCard({ title, Icon, link }: any) {
  return (
    <a
      href={link}
      className="flex flex-col items-center justify-center p-6 bg-[#e8dfd3] rounded-lg shadow hover:bg-[#5a4636] hover:text-[#f5efe6] transition"
    >
      <Icon size={24} />
      <span className="mt-2 font-semibold text-center">{title}</span>
    </a>
  );
}