export default function ArtCard({ title, artist, img }: any) {
  return (
    <div className="bg-[#e8dfd3] rounded-lg overflow-hidden shadow hover:shadow-lg transition">
      <img src={img} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-[#5a4636]">by {artist}</p>
      </div>
    </div>
  );
}