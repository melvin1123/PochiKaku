"use client";

import Link from "next/link";

const navItems = [
  { name: "Explore", href: "/auth" },
  { name: "Community", href: "/auth" },
  { name: "Join", href: "/auth" },
];

export default function Navbar() {
  return (
    <nav className="py-6 px-6 md:px-16 flex justify-between items-center sticky top-0 bg-[#f5efe6]/90 backdrop-blur-sm z-50">
      <h1 className="font-bold text-2xl">PochiKaku</h1>
      <div className="flex gap-6">

        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="hover:text-[#6b4f3b] transition"
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}