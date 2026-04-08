import { FaBell } from "react-icons/fa";

export default function Topbar() {
  return (
    <div className="flex justify-end items-center p-4">
      <button className="relative p-1 hover:text-[#5a4636] transition">
        <FaBell size={24} className="text-[#3e2c23]" />
        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <div className="flex items-center space-x-2 ml-4 cursor-pointer">
        <img
          src="/avatar.jpg"
          alt="User Avatar"
          className="w-10 h-10 rounded-full object-cover border-2 border-[#5a4636]"
        />
        <span className="font-medium text-[#3e2c23]">ArtistName</span>
      </div>
    </div>
  );
}