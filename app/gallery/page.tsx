"use client";

// pages/gallery.js
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { FaBell, FaSearch, FaHeart } from "react-icons/fa";

const galleryItems = [
  { id: 1, title: "Sunset Dreams", artist: "Alice", img: "/art1.jpg" },
  { id: 2, title: "City Vibes", artist: "Bob", img: "/art2.jpg" },
  { id: 3, title: "Mystic Forest", artist: "Cara", img: "/art3.jpg" },
  { id: 4, title: "Ocean Waves", artist: "Diana", img: "/art4.jpg" },
  { id: 5, title: "Night Sky", artist: "Evan", img: "/art5.jpg" },
];

export default function Gallery() {
  const [selectedArt, setSelectedArt] = useState(null);

  return (
    <div className="flex min-h-screen bg-[#f5efe6] text-[#3e2c23]">

      {/* Sidebar */}
      <aside className="w-64 bg-[#3e2c23] text-[#f5efe6] flex flex-col p-6">
        <h1 className="text-2xl font-bold mb-8">PochiKaku</h1>
        <nav className="flex flex-col space-y-4">
          {["Home","Gallery","Events","Settings"].map((link) => (
            <a key={link} href="#" className="hover:text-[#e8dfd3]">{link}</a>
          ))}
          <a href="#" className="hover:text-[#e8dfd3] mt-auto">Logout</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">

        {/* Top Bar */}
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

        {/* Header + Search (aligned nicely) */}
        <div className="flex justify-between items-end ml-8 mr-8 mb-4">
        
        {/* Left: Title + Subtitle */}
        <div>
            <h2 className="text-3xl font-bold">Gallery</h2>
            <p className="text-[#5a4636] mt-1">
            Explore the latest artworks from the community.
            </p>
        </div>

        {/* Right: Search */}
        <div className="relative w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a4636]" />
            <input
            type="text"
            placeholder="Search artworks..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#5a4636] bg-[#e8dfd3] focus:outline-none"
            />
        </div>

        </div>

        {/* Gallery Grid */}
        <section className="p-4 ml-4 mr-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galleryItems.map((art) => (
              <div
                key={art.id}
                className="group relative bg-[#e8dfd3] rounded-lg overflow-hidden shadow hover:shadow-lg cursor-pointer transition transform hover:scale-105"
                onClick={() => setSelectedArt(art)}
              >
                {/* Image */}
                <img
                  src={art.img}
                  alt={art.title}
                  className="w-full h-48 object-cover"
                />

                {/* Like Button (UI only) */}
                <div className="absolute top-2 right-2 bg-white/80 p-2 rounded-full">
                  <FaHeart className="text-[#5a4636]" />
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <span className="text-white font-semibold">View</span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h4 className="font-semibold">{art.title}</h4>
                  <p className="text-sm text-[#5a4636]">
                    by {art.artist}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Modal */}
        <Dialog
          open={!!selectedArt}
          onClose={() => setSelectedArt(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        >
          <Dialog.Panel className="bg-[#f5efe6] rounded-lg max-w-lg w-full p-4">
            {selectedArt && (
              <>
                <img
                  src={selectedArt.img}
                  alt={selectedArt.title}
                  className="w-full rounded-md"
                />
                <div className="mt-2 text-center">
                  <h2 className="font-bold text-lg">{selectedArt.title}</h2>
                  <p className="text-sm text-[#5a4636]">
                    by {selectedArt.artist}
                  </p>
                </div>
              </>
            )}
          </Dialog.Panel>
        </Dialog>

      </main>
    </div>
  );
}